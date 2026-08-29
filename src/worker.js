const TRON_ADDRESS =
  "TMUkQBpA5vTXt9CqJdi2SMtAcUiMgNBj8T";

const TRON_API =
  "https://api.trongrid.io";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    if (url.pathname === "/api/tron") {
      return await tronTransactions();
    }

    return new Response("Not found", { status: 404 });
  }
};

async function tronTransactions() {
  try {
    const response = await fetch(
      `${TRON_API}/v1/accounts/${TRON_ADDRESS}/transactions?limit=20&only_to=true`
    );

    if (!response.ok) {
      return Response.json(
        { error: "TRON API error" },
        { status: 502 }
      );
    }

    const data = await response.json();

    const transactions = (data.data || []).map(tx => ({
      network: "TRON",
      txid: tx.txID,
      timestamp: tx.block_timestamp,
      confirmed: !!tx.blockNumber,
      contractCount:
        Array.isArray(tx.raw_data?.contract)
          ? tx.raw_data.contract.length
          : 0
    }));

    return Response.json({
      address: TRON_ADDRESS,
      transactions
    });

  } catch (error) {
    return Response.json(
      { error: "Unable to read TRON data" },
      { status: 500 }
    );
  }
}

const HTML = `
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1">

<title>TRON Monitor</title>

<style>
body {
  font-family: system-ui;
  margin: 0;
  padding: 20px;
  background: #f4f4f5;
}

main {
  max-width: 750px;
  margin: auto;
  background: white;
  padding: 20px;
  border-radius: 16px;
}

button {
  padding: 12px 20px;
  border: 0;
  border-radius: 10px;
}

.card {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

.tx {
  word-break: break-all;
  font-size: 12px;
}
</style>
</head>

<body>

<main>

<h2>مانیتور TRON</h2>

<p>
آدرس تحت پایش:
</p>

<div class="tx">
${TRON_ADDRESS}
</div>

<button onclick="loadData()">
بررسی دوباره
</button>

<div id="status">
در حال بررسی...
</div>

<div id="list"></div>

</main>

<script>

async function loadData() {

  const status =
    document.getElementById("status");

  const list =
    document.getElementById("list");

  status.textContent =
    "در حال بررسی بلاکچین...";

  try {

    const response =
      await fetch("/api/tron");

    const data =
      await response.json();

    list.innerHTML = "";

    for (const tx of
         (data.transactions || [])) {

      const card =
        document.createElement("div");

      card.className = "card";

      const date =
        tx.timestamp
          ? new Date(tx.timestamp)
              .toLocaleString("fa-IR")
          : "نامشخص";

      card.innerHTML = `
        <b>TRON</b>

        <p>
        وضعیت:
        ${tx.confirmed
          ? "🟢 تأیید شده"
          : "🟡 در حال پردازش"}
        </p>

        <p>
        زمان:
        ${date}
        </p>

        <div class="tx">
        TXID:
        ${tx.txid || ""}
        </div>
      `;

      list.appendChild(card);
    }

    status.textContent =
      "آخرین بررسی: " +
      new Date().toLocaleTimeString("fa-IR");

  } catch (error) {

    status.textContent =
      "خطا در دریافت اطلاعات TRON";
  }
}

loadData();

setInterval(loadData, 30000);

</script>

</body>
</html>
`;
