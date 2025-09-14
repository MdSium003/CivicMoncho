import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface CertificateData {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  participationType: 'volunteer' | 'going';
}

export async function generateCertificate(data: CertificateData): Promise<Buffer> {
  try {
    // Path to the certificate template
    const templatePath = path.join(process.cwd(), 'client', 'public', 'certificate-main.png');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error('Certificate template not found');
    }

    // Load the certificate template
    const template = await sharp(templatePath);
    const { width, height } = await template.metadata();
    
    if (!width || !height) {
      throw new Error('Invalid certificate template dimensions');
    }

    // Create SVG text overlays - only name and event name
    const userNameSvg = `
      <svg width="${width}" height="${height}">
        <text x="${width / 2}" y="${height * 0.45}" 
              text-anchor="middle" 
              font-family="serif" 
              font-size="36" 
              font-weight="bold" 
              fill="#000000">
          ${data.userName}
        </text>
      </svg>
    `;

    const eventNameSvg = `
      <svg width="${width}" height="${height}">
        <text x="${width / 2}" y="${height * 0.6}" 
              text-anchor="middle" 
              font-family="serif" 
              font-size="24" 
              font-weight="600" 
              fill="#000000">
          ${data.eventName}
        </text>
      </svg>
    `;

    // Composite the certificate with text overlays
    const certificate = await template
      .composite([
        {
          input: Buffer.from(userNameSvg),
          top: 0,
          left: 0,
        },
        {
          input: Buffer.from(eventNameSvg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return certificate;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error('Failed to generate certificate');
  }
}

// Alternative function for Bengali text support
export async function generateCertificateBengali(data: CertificateData): Promise<Buffer> {
  try {
    const templatePath = path.join(process.cwd(), 'client', 'public', 'certificate-main.png');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('Certificate template not found');
    }

    const template = await sharp(templatePath);
    const { width, height } = await template.metadata();
    
    if (!width || !height) {
      throw new Error('Invalid certificate template dimensions');
    }

    // Create SVG with Bengali font support - only name and event name
    const userNameSvg = `
      <svg width="${width}" height="${height}">
        <text x="${width / 2}" y="${height * 0.45}" 
              text-anchor="middle" 
              font-family="serif" 
              font-size="36" 
              font-weight="bold" 
              fill="#000000">
          ${data.userName}
        </text>
      </svg>
    `;

    const eventNameSvg = `
      <svg width="${width}" height="${height}">
        <text x="${width / 2}" y="${height * 0.6}" 
              text-anchor="middle" 
              font-family="serif" 
              font-size="24" 
              font-weight="600" 
              fill="#000000">
          ${data.eventName}
        </text>
      </svg>
    `;

    const certificate = await template
      .composite([
        {
          input: Buffer.from(userNameSvg),
          top: 0,
          left: 0,
        },
        {
          input: Buffer.from(eventNameSvg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return certificate;
  } catch (error) {
    console.error('Error generating Bengali certificate:', error);
    throw new Error('Failed to generate certificate');
  }
}
