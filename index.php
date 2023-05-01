<?php
// Menentukan token bot dari parameter GET
$botToken = "TOKEN BOT KAMU"
// API endpoint untuk bot
$apiEndpoint = "https://api.telegram.org/bot".$botToken;

// Ambil data dari webhook Telegram
$update = json_decode(file_get_contents('php://input'), TRUE);

// Ambil informasi dari pesan
$message = $update['message'];
$chatId = $message['chat']['id'];
$text = $message['text'];

if ($text == '/start') {
      $sendMessageAbout = array(
        'chat_id' => $chatId,
        'text' => "Bot Created Using Bot @BotMakerApp"
    );
       $about = $apiEndpoint.'/sendMessage?'.http_build_query($sendMessageAbout);
    file_get_contents($about);
    // Teks start
    $startMessage = "Selamat datang di bot kalkulator. Silakan kirimkan ekspresi matematika untuk dihitung.
    + = PerTambahan
    - = PengKurangan
    / = PemBagian
    * = PerKalian";
    $sendMessageParams = array(
        'chat_id' => $chatId,
        'text' => $startMessage
    );
    $sendMessageUrl = $apiEndpoint.'/sendMessage?'.http_build_query($sendMessageParams);
    file_get_contents($sendMessageUrl);
} else {
    // Proses teks pesan sebagai ekspresi matematika
    $result = eval("return $text;");
    
    // Kirim hasil kalkulasi ke pengguna
    $response = "Hasil kalkulasi: $result";
    $sendMessageParams = array(
        'chat_id' => $chatId,
        'text' => $response
    );
    $sendMessageUrl = $apiEndpoint.'/sendMessage?'.http_build_query($sendMessageParams);
    file_get_contents($sendMessageUrl);
}
?>
