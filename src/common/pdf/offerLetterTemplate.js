// file: generateOfferLetterPreview.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Fully updated version:
 * ✔ Background watermark
 * ✔ Header logo
 * ✔ Company name left + Company address right
 * ✔ Centered title
 * ✔ Signature support
 * ✔ Placeholder replacer
 * ✔ Autowrap + page break
 */
export async function generateOfferLetterPreview(data = {}) {
  const safeStr = (v = "") => (typeof v === "string" ? v : String(v || ""));

  const formatToday = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatJoiningDate = (d) => {
  if (!d) return "";

  // Expected input: DD-MM-YYYY
  const [day, month, year] = d.split("-");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const m = Number(month) - 1;
  if (m < 0 || m > 11) return d; // fallback if invalid

  return `${monthNames[m]} ${Number(day)}, ${year}`;
};


  const details = {
    first_name: safeStr(data.first_name),
    last_name: safeStr(data.last_name),
    emp_id: safeStr(data.emp_id),
    joining_date: safeStr(formatJoiningDate(data.joining_date)),
    address_line: safeStr(data.address_line),
    position: safeStr(data.position),
    posting_location: safeStr(data.posting_location),
    probation_period: safeStr(data.probation_period),

    company_name: safeStr(data.company_name),
    company_address: safeStr(data.company_address),
    hr_name: safeStr(data.hr_name),

    issue_date: safeStr(data.issue_date || formatToday()),

    company_logo: data.company_logo || null,
    hr_signature: data.hr_signature || null,

    body_content:
      Array.isArray(data.body_content) && data.body_content.length
        ? data.body_content
        : [
            `Dear {first_name} {last_name},`,
            `We are pleased to offer you the position of {position} at {company_name}.`,
            `Your place of posting will be {posting_location}.`,
            `Your position will be subject to a probation period of {probation_period}.`,
            `Please note that management may confirm or terminate your offer based on performance.`,
            `We request you to join us on {joining_date}. Kindly confirm your acceptance.`,
            `Please feel free to reach out for any clarifications.`,
          ],
  };

  const MARGINS = { left: 50, right: 50, top: 800, bottom: 60 };
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const contentMaxWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = MARGINS.top;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // IMAGE EMBEDDER
  const embedImageFromDataUrl = async (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== "string") return null;
    try {
      if (dataUrl.startsWith("data:image/png"))
        return await pdfDoc.embedPng(dataUrl);
      if (dataUrl.startsWith("data:image/jpeg"))
        return await pdfDoc.embedJpg(dataUrl);

      try {
        return await pdfDoc.embedPng(dataUrl);
      } catch {}
      try {
        return await pdfDoc.embedJpg(dataUrl);
      } catch {}
    } catch {}
    return null;
  };

  // WATERMARK LOGO
  const backgroundLogo = details.company_logo
    ? await embedImageFromDataUrl(details.company_logo)
    : null;

  const drawBackgroundLogo = (logoImg) => {
    if (!logoImg) return;

    const bgWidth = PAGE_WIDTH * 0.7;
    const bgHeight = (logoImg.height / logoImg.width) * bgWidth;

    const x = (PAGE_WIDTH - bgWidth) / 2;
    const y = (PAGE_HEIGHT - bgHeight) / 2;

    page.drawImage(logoImg, {
      x,
      y,
      width: bgWidth,
      height: bgHeight,
      opacity: 0.08,
    });
  };

  // NEW PAGE
  const addNewPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = MARGINS.top;
    if (backgroundLogo) drawBackgroundLogo(backgroundLogo);
  };

  // TEXT WRITER
  const writeLine = (
    text,
    size = 12,
    isBold = false,
    leading = 18,
    x = MARGINS.left
  ) => {
    if (!text && text !== "0") return;
    const usedFont = isBold ? bold : font;

    // line wrapping
    const words = String(text).split(/\s+/);
    let line = "";

    for (let word of words) {
      const testLine = line ? line + " " + word : word;
      if (usedFont.widthOfTextAtSize(testLine, size) < contentMaxWidth) {
        line = testLine;
      } else {
        if (cursorY - leading < MARGINS.bottom) addNewPage();
        page.drawText(line, { x, y: cursorY, size, font: usedFont });
        cursorY -= leading;
        line = word;
      }
    }

    if (line) {
      if (cursorY - leading < MARGINS.bottom) addNewPage();
      page.drawText(line, { x, y: cursorY, size, font: usedFont });
      cursorY -= leading;
    }
  };

  // Draw watermark on page 1
  if (backgroundLogo) drawBackgroundLogo(backgroundLogo);

  // HEADER LOGO
  if (details.company_logo) {
    const logoImg = await embedImageFromDataUrl(details.company_logo);
    if (logoImg) {
      const logoWidth = 50;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;

      page.drawImage(logoImg, {
        x: MARGINS.left,
        y: cursorY - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });

      cursorY -= logoHeight + 10;
    }
  }

  // -------------------------------
  // COMPANY NAME (LEFT) + ADDRESS (RIGHT)
  // -------------------------------

  const companyNameSize = 15;
  const nameWidth = bold.widthOfTextAtSize(
    details.company_name,
    companyNameSize
  );

  // Print company name
  page.drawText(details.company_name, {
    x: MARGINS.left + 100,
    y: cursorY,
    size: companyNameSize,
    font: bold,
  });

  // Right-side company address
  if (details.company_address) {
    const addrLines = details.company_address.split("\n");

    const addrX = PAGE_WIDTH - MARGINS.right - 200; // control right side width
    let addrY = cursorY;

    addrLines.forEach((ln) => {
      page.drawText(ln, {
        x: addrX,
        y: addrY,
        size: 11,
        font,
      });
      addrY -= 14;
    });

    cursorY = addrY - 10;
  } else {
    cursorY -= 30;
  }

  // Horizontal line
  page.drawLine({
    start: { x: MARGINS.left, y: cursorY },
    end: { x: PAGE_WIDTH - MARGINS.right, y: cursorY },
    thickness: 1,
  });

  cursorY -= 30;

  // DATE (Right aligned)
  const dateText = `Date: ${details.issue_date}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 12);

  page.drawText(dateText, {
    x: PAGE_WIDTH - MARGINS.right - dateWidth,
    y: cursorY,
    size: 12,
    font,
  });

  cursorY -= 26;

  // EMPLOYEE NAME + ADDRESS
  writeLine(`${details.first_name} ${details.last_name}`, 12, false, 16);
  if (details.address_line) {
    details.address_line
      .split("\n")
      .forEach((ln) => writeLine(ln, 12, false, 15));
  }

  cursorY -= 10;

  // CENTER TITLE
  const title = "OFFER LETTER";
  const titleSize = 16;
  const titleWidth = bold.widthOfTextAtSize(title, titleSize);

  page.drawText(title, {
    x: (PAGE_WIDTH - titleWidth) / 2,
    y: cursorY,
    size: titleSize,
    font: bold,
  });

  cursorY -= 30;

  // PLACEHOLDER REPLACER
  const replaceVars = (t = "") =>
    String(t)
      .replace(/\{first_name\}/g, details.first_name)
      .replace(/\{last_name\}/g, details.last_name)
      .replace(/\{joining_date\}/g, details.joining_date)
      .replace(/\{position\}/g, details.position)
      .replace(/\{company_name\}/g, details.company_name)
      .replace(/\{posting_location\}/g, details.posting_location)
      .replace(/\{probation_period\}/g, details.probation_period);

  // BODY CONTENT
  details.body_content.forEach((para) => {
    replaceVars(para)
      .split("\n")
      .forEach((ln) => writeLine(ln, 12, false, 18));
    cursorY -= 8;
  });

  // SIGNATURE
  cursorY -= 10;
  writeLine("Sincerely,", 12, false, 18);

  if (details.hr_signature) {
    const signImg = await embedImageFromDataUrl(details.hr_signature);
    if (signImg) {
      const sw = 140;
      const sh = (signImg.height / signImg.width) * sw;

      page.drawImage(signImg, {
        x: MARGINS.left,
        y: cursorY - sh,
        width: sw,
        height: sh,
      });

      cursorY -= sh + 10;
    }
  }

  writeLine(details.hr_name || "", 12, true, 16);
  writeLine("HR Manager", 12, false, 16);

  // OUTPUT
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  return {
    url: URL.createObjectURL(blob),
    fileName: `${details.first_name || "Candidate"}_Offer_Letter.pdf`,
  };
}
