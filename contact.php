<?php
/**
 * YASH MAURYA PORTFOLIO - contact.php
 * Contact form handler with email + WhatsApp notification support
 */

// ─── Headers ────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── Only allow POST ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Please use POST.'
    ]);
    exit;
}

// ─── Rate limiting (simple IP-based, file-based) ─────────────
$rateFile = sys_get_temp_dir() . '/portfolio_rate_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateLimit = 5;     // max requests
$rateWindow = 300;  // per 5 minutes

if (file_exists($rateFile)) {
    $data = json_decode(file_get_contents($rateFile), true);
    if ($data && (time() - $data['timestamp']) < $rateWindow) {
        if ($data['count'] >= $rateLimit) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => 'Too many requests. Please wait a few minutes before trying again.'
            ]);
            exit;
        }
        $data['count']++;
    } else {
        $data = ['timestamp' => time(), 'count' => 1];
    }
} else {
    $data = ['timestamp' => time(), 'count' => 1];
}
file_put_contents($rateFile, json_encode($data));

// ─── Input Sanitization ──────────────────────────────────────
function sanitizeString(string $input): string {
    $input = trim($input);
    $input = strip_tags($input);
    $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return $input;
}

$name    = sanitizeString($_POST['name']    ?? '');
$email   = trim($_POST['email']             ?? '');
$subject = sanitizeString($_POST['subject'] ?? '');
$message = sanitizeString($_POST['message'] ?? '');

// ─── Validation ──────────────────────────────────────────────
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
} elseif (mb_strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
} elseif (mb_strlen($name) > 100) {
    $errors[] = 'Name must not exceed 100 characters.';
}

if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
} elseif (mb_strlen($email) > 254) {
    $errors[] = 'Email address is too long.';
}

if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
} elseif (mb_strlen($message) > 5000) {
    $errors[] = 'Message must not exceed 5000 characters.';
}

if (empty($subject)) {
    $subject = 'No Subject';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// ─── Spam Check (honeypot) ────────────────────────────────────
if (!empty($_POST['website'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully! I will get back to you soon.'
    ]);
    exit;
}

// ─── Email Configuration ─────────────────────────────────────
$to      = 'yash223101@gmail.com';
$safeEmail = filter_var($email, FILTER_SANITIZE_EMAIL);

$emailSubject = 'Portfolio Contact: ' . $subject;

$emailBody  = "===========================================\n";
$emailBody .= "  NEW CONTACT FORM SUBMISSION\n";
$emailBody .= "  Yash Maurya Portfolio\n";
$emailBody .= "===========================================\n\n";
$emailBody .= "From    : {$name}\n";
$emailBody .= "Email   : {$safeEmail}\n";
$emailBody .= "Subject : {$subject}\n";
$emailBody .= "Date    : " . date('d M Y, H:i:s') . "\n";
$emailBody .= "IP      : " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n\n";
$emailBody .= "-------------------------------------------\n";
$emailBody .= "MESSAGE:\n";
$emailBody .= "-------------------------------------------\n\n";
$emailBody .= $message . "\n\n";
$emailBody .= "===========================================\n";
$emailBody .= "  Reply to: {$safeEmail}\n";
$emailBody .= "===========================================\n";

$headers  = "From: Portfolio Contact <noreply@yashmaurya.dev>\r\n";
$headers .= "Reply-To: {$name} <{$safeEmail}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Priority: 1\r\n";

// ─── Send Email ───────────────────────────────────────────────
$sent = mail($to, $emailSubject, $emailBody, $headers);

// ─── Optional: Log to file ────────────────────────────────────
$logFile = __DIR__ . '/contact_log.txt';
$logEntry = sprintf(
    "[%s] From: %s <%s> | Subject: %s | IP: %s | Sent: %s\n",
    date('Y-m-d H:i:s'),
    $name,
    $safeEmail,
    $subject,
    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    $sent ? 'YES' : 'NO'
);

if (is_writable(__DIR__)) {
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// ─── Response ─────────────────────────────────────────────────
if ($sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully! I will get back to you soon. 🚀'
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'Message could not be delivered via email. Please reach out directly at yash223101@gmail.com or via WhatsApp.'
    ]);
}
?>
