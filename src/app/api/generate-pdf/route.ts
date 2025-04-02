import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    // Convert markdown to HTML
    const htmlContent = marked(content);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Create new page
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Generate HTML content with premium styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary-color: #1a365d;
              --secondary-color: #2d3748;
              --accent-color: #4a5568;
              --text-color: #2d3748;
              --light-gray: #f7fafc;
              --border-color: #e2e8f0;
            }

            body {
              font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.8;
              color: var(--text-color);
              max-width: 900px;
              margin: 0 auto;
              padding: 60px;
              background-color: white;
            }

            .header {
              text-align: center;
              margin-bottom: 60px;
              position: relative;
              padding-bottom: 40px;
              border-bottom: 2px solid var(--border-color);
            }

            .header::after {
              content: '';
              display: block;
              width: 60px;
              height: 4px;
              background: linear-gradient(to right, #1a365d, #4a5568);
              margin: 20px auto;
            }

            .header-title {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              font-weight: 700;
              color: var(--primary-color);
              margin-bottom: 20px;
              letter-spacing: -0.5px;
              line-height: 1.2;
            }

            .header-subtitle {
              font-size: 20px;
              color: var(--accent-color);
              margin-bottom: 30px;
            }

            .header-meta {
              font-size: 14px;
              color: var(--accent-color);
              display: flex;
              justify-content: center;
              gap: 20px;
            }

            h1 {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              color: var(--primary-color);
              margin-bottom: 20px;
              letter-spacing: -0.5px;
            }

            h2 {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 700;
              color: var(--primary-color);
              margin-top: 48px;
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid var(--border-color);
              letter-spacing: -0.3px;
            }

            h3 {
              font-family: 'Playfair Display', serif;
              font-size: 24px;
              font-weight: 700;
              color: var(--secondary-color);
              margin-top: 36px;
              margin-bottom: 16px;
              letter-spacing: -0.2px;
            }

            p {
              margin-bottom: 24px;
              font-size: 15px;
              color: var(--text-color);
              text-align: justify;
            }

            ul {
              margin-bottom: 24px;
              padding-left: 32px;
            }

            li {
              margin-bottom: 12px;
              position: relative;
              line-height: 1.8;
            }

            li::before {
              content: '•';
              color: var(--primary-color);
              font-weight: bold;
              position: absolute;
              left: -16px;
            }

            code {
              background-color: var(--light-gray);
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
              font-size: 13px;
              border: 1px solid var(--border-color);
            }

            pre {
              background-color: var(--light-gray);
              padding: 24px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 24px 0;
              border: 1px solid var(--border-color);
            }

            pre code {
              background-color: transparent;
              padding: 0;
              border: none;
              font-size: 14px;
            }

            blockquote {
              border-left: 4px solid var(--primary-color);
              padding-left: 24px;
              margin: 32px 0;
              color: var(--accent-color);
              font-style: italic;
              font-size: 16px;
              position: relative;
            }

            blockquote::before {
              content: '"';
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              color: var(--primary-color);
              opacity: 0.2;
              position: absolute;
              left: -16px;
              top: -8px;
            }

            .executive-summary {
              background-color: var(--light-gray);
              padding: 32px;
              border-radius: 8px;
              margin: 32px 0;
              border: 1px solid var(--border-color);
            }

            .key-findings {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
              margin: 32px 0;
            }

            .finding-box {
              background-color: var(--light-gray);
              padding: 24px;
              border-radius: 8px;
              border: 1px solid var(--border-color);
            }

            .finding-box h4 {
              color: var(--primary-color);
              margin-bottom: 12px;
              font-size: 18px;
            }

            .section-divider {
              height: 2px;
              background: linear-gradient(to right, var(--primary-color), var(--accent-color));
              margin: 48px 0;
              opacity: 0.5;
            }

            .footer {
              margin-top: 60px;
              padding-top: 30px;
              border-top: 1px solid var(--border-color);
              font-size: 12px;
              color: var(--accent-color);
              text-align: center;
            }

            .page-number {
              position: fixed;
              bottom: 20px;
              right: 20px;
              font-size: 12px;
              color: var(--accent-color);
            }

            .table-of-contents {
              background-color: var(--light-gray);
              padding: 24px;
              border-radius: 8px;
              margin: 32px 0;
              border: 1px solid var(--border-color);
            }

            .table-of-contents h2 {
              margin-top: 0;
              font-size: 24px;
            }

            .table-of-contents ul {
              list-style: none;
              padding-left: 0;
            }

            .table-of-contents li {
              margin-bottom: 8px;
              padding-left: 0;
            }

            .table-of-contents li::before {
              display: none;
            }

            .table-of-contents a {
              color: var(--primary-color);
              text-decoration: none;
              font-size: 14px;
            }

            .table-of-contents a:hover {
              text-decoration: underline;
            }

            @media print {
              body {
                padding: 40px;
              }

              h1, h2, h3 {
                break-after: avoid;
              }

              p, ul, pre, blockquote, .executive-summary, .finding-box {
                break-inside: avoid;
              }

              .page-number {
                position: fixed;
                bottom: 20px;
                right: 20px;
              }

              code {
                background-color: transparent;
                border: 1px solid var(--border-color);
              }

              pre {
                background-color: transparent;
                border: 1px solid var(--border-color);
              }

              .key-findings {
                display: block;
              }

              .finding-box {
                margin-bottom: 24px;
              }

              .table-of-contents {
                background-color: transparent;
                border: none;
              }
            }

            @page {
              size: A4;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="header-title">Research Report</h1>
            <p class="header-subtitle">Comprehensive Technology Analysis</p>
            <div class="header-meta">
              <span>Generated by Super Tech Scout</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div class="table-of-contents">
            <h2>Table of Contents</h2>
            <ul>
              <li><a href="#executive-summary">Executive Summary</a></li>
              <li><a href="#technology-overview">Technology Overview</a></li>
              <li><a href="#technical-analysis">Technical Analysis</a></li>
              <li><a href="#market-analysis">Market Analysis</a></li>
              <li><a href="#security-compliance">Security and Compliance</a></li>
              <li><a href="#integration">Integration and Implementation</a></li>
              <li><a href="#future-outlook">Future Outlook</a></li>
              <li><a href="#recommendations">Strategic Recommendations</a></li>
              <li><a href="#risk-assessment">Risk Assessment</a></li>
              <li><a href="#conclusion">Conclusion</a></li>
            </ul>
          </div>

          ${htmlContent}

          <div class="section-divider"></div>

          <div class="footer">
            <p>Generated by Super Tech Scout | ${new Date().toLocaleDateString()}</p>
            <p style="font-size: 10px; margin-top: 8px;">This report was generated using advanced AI models and represents the latest insights in technology research.</p>
          </div>
        </body>
      </html>
    `;

    // Set content
    await page.setContent(html);

    // Generate PDF with high-quality settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm',
      },
      preferCSSPageSize: true,
    });

    // Close browser
    await browser.close();

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="research-report.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 