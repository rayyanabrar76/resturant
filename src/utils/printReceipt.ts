export interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface ReceiptData {
  orderDate: Date;
  eventDate: Date | null;
  fulfillment: 'pickup' | 'delivery';
  pickupTime?: string;
  guests: number;
  items: ReceiptItem[];
  totalPrice: number;
  locale: string;
}

export function printCateringReceipt(data: ReceiptData): void {
  const { orderDate, eventDate, fulfillment, pickupTime, guests, items, totalPrice, locale } = data;

  const fmt = (n: number) =>
    `€${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const L = (en: string, de: string, ar: string) =>
    locale === 'de' ? de : locale === 'ar' ? ar : en;

  const hr  = `<div class="hr"></div>`;
  const dhr = `<div class="hr dhr"></div>`;

  const itemRows = items.map(item => `
    <div class="item">
      <div class="item-name">${item.name}</div>
      <div class="item-sub">
        <span>${item.qty} x ${fmt(item.unitPrice)}</span>
        <span class="bold">${fmt(item.qty * item.unitPrice)}</span>
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8"/>
  <title>Catering Receipt</title>
  <style>
    /* ── Reset ── */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* ── Base: make the receipt fill the popup nicely on screen ── */
    html, body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff;
      color: #000;
    }

    body {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
      padding: 12px 14px 20px;
      font-size: 14px;
      line-height: 1.5;
    }

    /* ── Dividers ── */
    .hr  { border-top: 1px dashed #999; margin: 8px 0; }
    .dhr { border-top: 2px solid #000;  margin: 8px 0; }

    /* ── Header ── */
    .logo {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 3px;
    }
    .sub {
      text-align: center;
      font-size: 11px;
      color: #555;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    /* ── Section label ── */
    .label {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    /* ── Two-column row ── */
    .row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 3px;
    }

    /* ── Order title ── */
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 2px;
    }
    .printed {
      text-align: center;
      font-size: 11px;
      color: #666;
      margin-bottom: 2px;
    }

    /* ── Items ── */
    .item        { margin-bottom: 8px; }
    .item-name   { font-weight: bold; font-size: 13px; }
    .item-sub    { display: flex; justify-content: space-between; font-size: 12px; color: #444; }

    /* ── Total ── */
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: bold;
      margin: 6px 0 3px;
    }
    .vat-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #666;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      font-size: 11px;
      color: #666;
      margin-top: 3px;
      letter-spacing: 1px;
    }

    .bold { font-weight: bold; }

    /* ── Print: force 80mm receipt size, no margins ── */
    @media print {
      html, body {
        width: 80mm !important;
        max-width: 80mm !important;
        margin: 0 !important;
        padding: 4mm 3mm !important;
        font-size: 12px !important;
      }
      .logo  { font-size: 16px !important; }
      .title { font-size: 14px !important; }
      .total-row { font-size: 15px !important; }
      @page {
        size: 80mm auto;
        margin: 0;
      }
    }
  </style>
</head>
<body>

  <div class="logo">CHEF ABOUD KÜCHE</div>
  <div class="sub">Levantinische Küche · Berlin</div>
  <div class="sub">Friedhofsweg 1, 12529 Schönefeld</div>

  ${dhr}

  <div class="title">${L('CATERING ORDER', 'CATERING BESTELLUNG', 'طلب الضيافة')}</div>
  <div class="printed">${L('Printed', 'Gedruckt', 'طُبع')}: ${fmtDate(orderDate)} ${fmtTime(orderDate)}</div>

  ${hr}

  <div class="label">${L('Event Details', 'Veranstaltungsdetails', 'تفاصيل الفعالية')}</div>
  <div class="row">
    <span>${L('Event Date', 'Datum', 'تاريخ الفعالية')}</span>
    <span class="bold">${eventDate ? fmtDate(eventDate) : '—'}</span>
  </div>
  <div class="row">
    <span>${L('Guests', 'Gäste', 'الضيوف')}</span>
    <span class="bold">${guests}</span>
  </div>
  <div class="row">
    <span>${L('Method', 'Methode', 'الطريقة')}</span>
    <span class="bold">${fulfillment === 'pickup'
      ? L('Pickup', 'Abholung', 'استلام') + (pickupTime ? ` · ${pickupTime}` : '')
      : L('Delivery', 'Lieferung', 'توصيل')
    }</span>
  </div>

  ${hr}

  <div class="label">${L('Items', 'Artikel', 'الأصناف')}</div>
  ${itemRows}

  ${dhr}

  <div class="total-row">
    <span>${L('TOTAL', 'GESAMT', 'الإجمالي')}</span>
    <span>${fmt(totalPrice)}</span>
  </div>
  <div class="vat-row">
    <span>${L('incl. 19% VAT', 'inkl. 19% MwSt.', 'شامل 19% ضريبة')}</span>
    <span>${fmt(totalPrice / 1.19)} + ${fmt(totalPrice - totalPrice / 1.19)}</span>
  </div>

  ${hr}

  <div class="footer">${L('Thank you!', 'Vielen Dank!', 'شكراً لكم!')}</div>
  <div class="footer">chefaboudkueche.de</div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=420,height=700,scrollbars=yes');
  if (!win) {
    alert('Please allow popups for this page to print receipts.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}
