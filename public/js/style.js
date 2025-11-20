// ゲージの数値（0〜400%）を管理する変数
let gaugePercent = 0;

// 覚醒関連
let isAwaken = false;   // 覚醒中かどうか
let awakenWins = 0;     // 覚醒中の勝利回数（3でリセット）

// ===== HPバー機能実装 =====
const player_hpBar = document.querySelector("#player_meter");
const enemy_hpBar = document.querySelector("#enemy_meter");

// HP変数を更新
let player_hp = 150;
let enemy_hp = 150;

// meterに反映（＝同期させる）
player_hpBar.value = player_hp;
enemy_hpBar.value = enemy_hp;

// ダメージの設定
let damageValue = -20;

// ログを保存する箱を用意
const play_log = [];

// ターンを設定
let turnCount = 0;

// 覚醒回数を設定
let awakenCount = 0;


// ★ ゲーム終了をまとめて処理する関数
function finishGame(finalText) {
  // finalText: "You Win!!" / "You Lose..." など
  play_log.push("FinalResult: " + finalText);

  try {
    localStorage.setItem("evaJankenPlayLog", JSON.stringify(play_log));
    console.log("ローカルストレージに保存:", play_log);
  } catch (e) {
    console.error("ログの保存に失敗しました:", e);
  }

  // 5秒後に exit.html へ
  setTimeout(() => {
    window.location.href = "exit.html";
  }, 5000);
}


// シンクロ率の表示機能を実装
function updateGaugeDisplay() {
  $("#gauge_value").text(gaugePercent + "%");
}


// じゃんけんクリック
$(".block_card, .scissors_card, .paper_card").on("click", function () {
  // どの手かを一度だけ判定
  const isRock = $(this).hasClass("block_card");
  const isScissors = $(this).hasClass("scissors_card");
  const isPaper = $(this).hasClass("paper_card");

  // ===== 覚醒中はここだけ通す（通常処理は完全スキップ）=====
  if (isAwaken) {
    if (isRock) {
      $(".computer_box").html('<img src="./image/敵_チョキ.png" width="100%">');
      play_log.push("player_card: Rock");
      play_log.push("enemy_card: Scissors (forced lose by Awaken)");
    } else if (isScissors) {
      $(".computer_box").html('<img src="./image/敵_パー.png" width="100%">');
      play_log.push("player_card: Scissors");
      play_log.push("enemy_card: Paper (forced lose by Awaken)");
    } else if (isPaper) {
      $(".computer_box").html('<img src="./image/敵_グー.png" width="100%">');
      play_log.push("player_card: Paper");
      play_log.push("enemy_card: Rock (forced lose by Awaken)");
    }

    // 勝利固定
    $(".judge").html("Hit").css("color", "red");
    play_log.push("Result: Hit (Awaken)");

    enemy_hp += damageValue;
    enemy_hpBar.value = enemy_hp;
    play_log.push("Enemy_HP: " + enemy_hp);

    // 敵HPが0以下になったら勝利表示
    if (enemy_hp <= 0) {
      $(".judge").html("You Win!!").css("color", "#d0e94fff");
      $(".block_card, .scissors_card, .paper_card").off("click");
      play_log.push("Result: You Win!! (Awaken)");

      finishGame("You Win!!");
      return;
    }

    // 覚醒中は常に400%固定
    gaugePercent = 400;
    updateGaugeDisplay();

    // 覚醒中勝利カウント
    awakenWins++;
    console.log("覚醒中勝利カウント:", awakenWins, "/ 3");

    if (awakenWins >= 3) {
      isAwaken = false;
      awakenWins = 0;
      gaugePercent = 0;
      $("#awaken_text").html("ーーー").css("color", "#FF0000");
      updateGaugeDisplay();
      console.log("覚醒終了。ゲージリセット");
    }

    turnCount++;
    console.log("ターン数:", turnCount);
    play_log.push("Turn: " + turnCount);

    return; // 覚醒時は通常処理に行かない
  }

  // ===== ここから通常処理（覚醒していない時のみ）=====

  // 相手の手：乱数
  const random = Math.floor(Math.random() * 3);
  console.log(random, "ランダムな数字");

  if (random === 0) {
    console.log("グー");
    $(".computer_box").html('<img src="./image/敵_グー.png" width="100%">');
  } else if (random === 1) {
    console.log("チョキ");
    $(".computer_box").html('<img src="./image/敵_チョキ.png" width="100%">');
  } else {
    console.log("パー");
    $(".computer_box").html('<img src="./image/敵_パー.png" width="100%">');
  }

  turnCount++;
  console.log("ターン数:", turnCount);
  play_log.push("Turn: " + turnCount);

  // 勝敗判定（通常）

  // --------プレイヤーがグーの場合--------
  if (isRock) {
    if (random === 0) {
      $(".judge").html("Draw").css("color", "gray");
      play_log.push("player_card: Rock");
      play_log.push("enemy_card: Rock");
      play_log.push("Result: Draw");
    } else if (random === 1) {
      $(".judge").html("Hit").css("color", "red");
      play_log.push("player_card: Rock");
      play_log.push("enemy_card: Scissors");
      play_log.push("Result: Hit");

      gaugePercent = Math.min(gaugePercent + 100, 400);
      enemy_hp += damageValue;
      enemy_hpBar.value = enemy_hp;
      play_log.push("Enemy_HP: " + enemy_hp);

      if (enemy_hp <= 0) {
        $(".judge").html("You Win!!").css("color", "#d0e94fff");
        play_log.push("Result: You Win!!");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Win!!");
        return;
      }
    } else {
      $(".judge").html("Damage").css("color", "blue");
      play_log.push("player_card: Rock");
      play_log.push("enemy_card: Paper");
      play_log.push("Result: Damage");

      gaugePercent = Math.max(gaugePercent - 50, 0);
      player_hp += damageValue;
      player_hpBar.value = player_hp;
      play_log.push("Player_HP: " + player_hp);

      if (player_hp <= 0) {
        $(".judge").html("You Lose...").css("color", "#500fdbff");
        play_log.push("Result: You Lose...");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Lose...");
        return;
      }
    }

    // --------プレイヤーがチョキの場合--------
  } else if (isScissors) {
    if (random === 0) {
      $(".judge").html("Damage").css("color", "blue");
      play_log.push("player_card: Scissors");
      play_log.push("enemy_card: Rock");
      play_log.push("Result: Damage");

      gaugePercent = Math.max(gaugePercent - 50, 0);
      player_hp += damageValue;
      player_hpBar.value = player_hp;
      play_log.push("Player_HP: " + player_hp);

      if (player_hp <= 0) {
        $(".judge").html("You Lose...").css("color", "#500fdbff");
        play_log.push("Result: You Lose...");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Lose...");
        return;
      }
    } else if (random === 1) {
      $(".judge").html("Draw").css("color", "gray");
      play_log.push("player_card: Scissors");
      play_log.push("enemy_card: Scissors");
      play_log.push("Result: Draw");
    } else {
      $(".judge").html("Hit").css("color", "red");
      play_log.push("player_card: Scissors");
      play_log.push("enemy_card: Paper");
      play_log.push("Result: Hit");

      gaugePercent = Math.min(gaugePercent + 100, 400);
      enemy_hp += damageValue;
      enemy_hpBar.value = enemy_hp;
      play_log.push("Enemy_HP: " + enemy_hp);

      if (enemy_hp <= 0) {
        $(".judge").html("You Win!!").css("color", "#d0e94fff");
        play_log.push("Result: You Win!!");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Win!!");
        return;
      }
    }

    // --------プレイヤーがパーの場合--------
  } else if (isPaper) {
    if (random === 0) {
      $(".judge").html("Hit").css("color", "red");
      play_log.push("player_card: Paper");
      play_log.push("enemy_card: Rock");
      play_log.push("Result: Hit");

      gaugePercent = Math.min(gaugePercent + 100, 400);
      enemy_hp += damageValue;
      enemy_hpBar.value = enemy_hp;
      play_log.push("Enemy_HP: " + enemy_hp);

      if (enemy_hp <= 0) {
        $(".judge").html("You Win!!").css("color", "#d0e94fff");
        play_log.push("Result: You Win!!");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Win!!");
        return;
      }
    } else if (random === 1) {
      $(".judge").html("Damage").css("color", "blue");
      play_log.push("player_card: Paper");
      play_log.push("enemy_card: Scissors");
      play_log.push("Result: Damage");

      gaugePercent = Math.max(gaugePercent - 50, 0);
      player_hp += damageValue;
      player_hpBar.value = player_hp;
      play_log.push("Player_HP: " + player_hp);

      if (player_hp <= 0) {
        $(".judge").html("You Lose...").css("color", "#500fdbff");
        play_log.push("Result: You Lose...");
        $(".block_card, .scissors_card, .paper_card").off("click");
        finishGame("You Lose...");
        return;
      }
    } else {
      $(".judge").html("Draw").css("color", "gray");
      play_log.push("player_card: Paper");
      play_log.push("enemy_card: Paper");
      play_log.push("Result: Draw");
    }
  }

  // ゲージ表示更新（通常時）
  updateGaugeDisplay();

  // ここで覚醒突入判定
  if (gaugePercent >= 400) {
    awakenCount++;
    console.log("覚醒回数:", awakenCount);
    play_log.push("Awaken: " + awakenCount);

    gaugePercent = 400;
    isAwaken = true;
    awakenWins = 0;
    $("#awaken_text").html("覚醒中(無敵)").css("color", "#FF0000");
    updateGaugeDisplay();

    // 覚醒発動演出
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.6)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "9998";

    const img = document.createElement("img");
    img.src = "./image/awaken_img_01.jpeg";
    img.style.position = "fixed";
    img.style.width = "1000px";
    img.style.animation = "fadeZoomIn 0.8s ease";
    img.style.zIndex = "9999";

    img.onload = function () {
      console.log("画像読み込み成功");
    };
    img.onerror = function () {
      console.log("画像読み込み失敗: " + img.src);
    };

    modal.appendChild(img);
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.remove();
    }, 3000);

    console.log("覚醒発動準備（次ターンから強制勝利）");
  }
});

console.log("プレイログ:", play_log);
