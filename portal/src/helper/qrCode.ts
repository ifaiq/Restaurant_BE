import QRCode from 'qrcode';

export interface QRCodeResult {
  qrCodeUrl: string;
  qrCodeImage: string;
}

/**
 * Generates a QR code for a restaurant table
 * @param restaurantId - The UUID of the restaurant
 * @param tableId - The UUID of the table
 * @param menuBaseUrl - Optional base URL for the menu (defaults to https://menu.jaggha.com)
 * @returns Promise with QR code URL and image (base64 data URL)
 */
export async function generateTableQRCode(
  restaurantId: string,
  tableId: string,
  menuBaseUrl?: string,
): Promise<QRCodeResult> {
  const baseUrl =
    menuBaseUrl || process.env.MENU_URL || 'https://menu.jaggha.com';
  const qrCodeUrl = `${baseUrl}/?rid=${restaurantId}&table=${tableId}`;

  const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    qrCodeUrl,
    qrCodeImage,
  };
}
