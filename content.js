console.log("Drive Access Auto-Select: Loaded (Calendar Supported)");

// 1秒ごとに画面を監視
setInterval(() => {
    scanAndSelectOnly();
}, 1000);

// 「現在のダイアログで実行済みか」を管理するフラグ
let hasExecutedForCurrentDialog = false;

function scanAndSelectOnly() {
    // 1. 「アクセス権を付与しない」ラベルを探す
    const xpath = "//label[contains(text(), 'アクセス権を付与しない')]";
    const snapshot = document.evaluate(xpath, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    // --- フラグ管理のロジック ---

    // 画面上にターゲットが「無い」または「見えない」場合
    let isVisible = false;
    if (snapshot.snapshotLength > 0) {
        for (let i = 0; i < snapshot.snapshotLength; i++) {
            if (snapshot.snapshotItem(i).offsetParent !== null) {
                isVisible = true;
                break;
            }
        }
    }

    // ダイアログが閉じた（見えなくなった）なら、次回のためにフラグをリセットする
    if (!isVisible) {
        if (hasExecutedForCurrentDialog) {
            // console.log("ダイアログが閉じたため、状態をリセットしました"); // ログがうるさければコメントアウト
            hasExecutedForCurrentDialog = false;
        }
        return;
    }

    // ダイアログが出ているが、すでにこの回で自動選択済みなら何もしない
    if (hasExecutedForCurrentDialog) {
        return;
    }

    // ---------------------------

    // 2. まだ実行していない場合、要素を特定してクリック
    for (let i = 0; i < snapshot.snapshotLength; i++) {
        const label = snapshot.snapshotItem(i);
        if (label.offsetParent === null) continue;

        const targetId = label.getAttribute("for");
        let radioButton = null;

        if (targetId) {
            radioButton = document.getElementById(targetId);
        }
        if (!radioButton && label.parentElement) {
            radioButton = label.parentElement.querySelector('input[type="radio"]');
        }

        if (radioButton) {
            console.log("初回自動選択を実行します");

            // 既に合致していても、念のためクリック動作は通しておく
            if (!radioButton.checked) {
                radioButton.click();
                radioButton.checked = true;
                const event = new Event('change', { bubbles: true });
                radioButton.dispatchEvent(event);
            }

            // 「実行済み」にする（ダイアログが閉じるまでロック）
            hasExecutedForCurrentDialog = true;
            return;
        }
    }
}