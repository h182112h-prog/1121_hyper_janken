// js/exit.js

window.addEventListener("DOMContentLoaded", async () => {
  const feedbackArea = document.getElementById("feedback_area");

  if (!feedbackArea) {
    console.error("#feedback_area が見つかりません");
    return;
  }

  // 1. localStorage からログを取り出す
  const rawLog = localStorage.getItem("evaJankenPlayLog");

  if (!rawLog) {
    feedbackArea.textContent = "プレイログが見つかりません。もう一度ゲームをプレイしてください。";
    return;
  }

  let playLog;
  try {
    playLog = JSON.parse(rawLog);  // style.js で保存した play_log 配列を復元
  } catch (e) {
    console.error("ログのJSON変換に失敗しました:", e);
    feedbackArea.textContent = "ログの読み込みに失敗しました。";
    return;
  }

  // 2. 配列をテキストに整形（server.js は logText を受け取る）
  const logText = playLog.join("\n");

  // 3. ロード中メッセージ
  feedbackArea.textContent = "戦闘ログを解析中... NERV本部からの報告を待機しています。";

  // 4. サーバーに送って AI コメントを取得
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ log: logText })
    });

    if (!res.ok) {
      throw new Error(`HTTPエラー: ${res.status}`);
    }

    const data = await res.json();

    // 5. AIの講評を表示
    feedbackArea.textContent = data.feedback || "フィードバックの取得に失敗しました。";

 } catch (err) {
    console.error("AIフィードバック取得エラー:", err);
    feedbackArea.textContent = "サーバーとの通信に失敗しました。server.js が起動しているか確認してください。";
  }

//   6. （お好みで）ログ削除
  localStorage.removeItem("evaJankenPlayLog");
});
