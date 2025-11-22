// AIにお題文を渡して解析結果をもらうファイル




// ===============================
// 必要なライブラリを読み込む
// ===============================

// Webサーバーを作るためのフレームワーク「Express」を読み込む
import express from "express";

// OpenAIのAPIを使うための公式ライブラリを読み込む
import OpenAI from "openai";

// .env ファイルから環境変数を読み込むためのライブラリ
import dotenv from "dotenv";


// ===============================
// .env の読み込み設定
// ===============================

// .env ファイルに書かれた値を process.env に読み込む
dotenv.config();


// ===============================
// Expressアプリ（サーバー本体）の準備
// ===============================

// Expressアプリ（サーバーの本体）を作成
const app = express();

// 「JSON形式のデータを受け取れるようにする」ための設定
// これを書いておくと、req.body で JSON が読める
app.use(express.json());


// public フォルダを静的公開する
app.use(express.static("public"));



// ===============================
// OpenAIクライアントの準備
// ===============================

// OpenAI API を呼び出すためのクライアントを作る
// apiKey には .env に書いた OPENAI_API_KEY を使う
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// ===============================
// /api/feedback というAPIの入口を定義
// ===============================

// フロント（exit.html側）から POST でアクセスされるエンドポイント
app.post("/api/feedback", async (req, res) => {

  // フロントから送られてきた「プレイログ文字列」を取り出す
  // exit.html 側の fetch で body: { log: logText } と送っている想定
  const logText = req.body.log;

  // ★ ここは自由に世界観を入れる部分（プロンプト＝AIへの依頼文）
  // logText をそのまま文字列の中に埋め込んで、AIに渡す文章を作っている
  const prompt = `
あなたはアニメ「新世紀エヴァンゲリオン」の赤城リツコ博士です。
以下は、ユーザーがプレイしたエヴァンゲリオン戦闘シミュレーションのログです。
赤城博士が主人公の碇シンジへ分析結果を報告するように、口語調かつ、女性口調で200文字程度の分析・講評してください。
なお、ログにおける各記録は以下の通りです。
- Rock：ジャンケンの「グー」を出したことを示す
- Paper：ジャンケンの「パー」を出したことを示す
- Scissors：ジャンケンの「チョキ」を出したことを示す
- Win：ユーザーが勝利したことを示す
- Lose：ユーザーが敗北したことを示す
- Draw：引き分けたことを示す
- awaken：エヴァンゲリオンが覚醒したことを示す

それでは、以下のプレイログを分析してください。


 

【プレイログ】
${logText}
  `.trim(); // 余計な前後の改行や空白を削ってキレイにする


  try {
    // ===============================
    // OpenAI API にリクエストを送る部分
    // ===============================

    // chat.completions.create で「チャット形式」でモデルを呼び出す
    const response = await client.chat.completions.create({
      // 使用するモデル（安価で軽めのGPT）
      model: "gpt-4o-mini",
      // AIに渡すメッセージ。ここでは user として prompt をそのまま渡す
      messages: [
        { role: "user", content: prompt }
      ]
    });

    // OpenAI から返ってきたテキスト本体を取り出す
    // choices[0].message.content に回答本文が入っている
    const feedback = response.choices[0].message.content;

    // フロント（exit.html）側に JSON 形式で返す
    // exit.html 側では data.feedback でこのテキストを受け取れる
    res.json({ feedback });

  } catch (e) {
    // もしAI呼び出しなどでエラーが起きた場合は、サーバー側にログを出す
    console.error(e);

    // フロント側にも「500エラー」と簡単なメッセージを返す
    res.status(500).json({ error: "AIエラー" });
  }
});


// ===============================
// サーバーを起動する
// ===============================

// サーバーを動かすポート番号を 3000 に設定
const PORT = 3000;

// サーバーを起動。起動したらコンソールにURLを表示
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
