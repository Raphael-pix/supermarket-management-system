import axios from "axios";

/**
 * M-Pesa STK Push Service
 * This is a mock implementation. In production, use actual Safaricom Daraja API
 */

class MpesaService {
  constructor() {
    // M-Pesa API credentials (use environment variables in production)
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "mock_consumer_key";
    this.consumerSecret =
      process.env.MPESA_CONSUMER_SECRET || "mock_consumer_secret";
    this.shortcode = process.env.MPESA_SHORTCODE || "174379";
    this.passkey = process.env.MPESA_PASSKEY || "mock_passkey";
    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      "http://localhost:5000/api/pos/payment/callback";
    this.environment = process.env.MPESA_ENVIRONMENT || "sandbox"; // 'sandbox' or 'production'
  }

  /**
   * Get OAuth access token from M-Pesa
   */
  async getAccessToken() {
    try {
      // In production, call actual M-Pesa OAuth endpoint
      if (this.environment === "production") {
        const auth = Buffer.from(
          `${this.consumerKey}:${this.consumerSecret}`,
        ).toString("base64");
        const response = await axios.get(
          "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          {
            headers: {
              Authorization: `Basic ${auth}`,
            },
          },
        );
        return response.data.access_token;
      }

      // Mock token for development
      return "mock_access_token_" + Date.now();
    } catch (error) {
      console.error("Failed to get M-Pesa access token:", error);
      throw new Error("M-Pesa authentication failed");
    }
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate password for STK Push
   */
  generatePassword(timestamp) {
    const data = this.shortcode + this.passkey + timestamp;
    return Buffer.from(data).toString("base64");
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-+]/g, "");

    // If starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  }

  /**
   * Initiate STK Push
   * @param {string} phoneNumber - Customer phone number
   * @param {number} amount - Amount to charge
   * @param {string} accountReference - Transaction reference
   * @param {string} transactionDesc - Description
   */
  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
  ) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const accessToken = await this.getAccessToken();

      // In production, call actual M-Pesa STK Push endpoint
      if (this.environment === "production") {
        const response = await axios.post(
          "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(amount), // M-Pesa requires integer
            PartyA: formattedPhone,
            PartyB: this.shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: this.callbackUrl,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        return {
          success: true,
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          customerMessage: response.data.CustomerMessage,
        };
      }

      // Mock response for development
      const mockCheckoutRequestId =
        "ws_CO_" + Date.now() + Math.random().toString(36).substring(7);
      const mockMerchantRequestId = "merchant_" + Date.now();

      console.log("🔄 Mock M-Pesa STK Push initiated:", {
        phone: formattedPhone,
        amount,
        accountReference,
        checkoutRequestId: mockCheckoutRequestId,
      });

      return {
        success: true,
        checkoutRequestId: mockCheckoutRequestId,
        merchantRequestId: mockMerchantRequestId,
        responseCode: "0",
        responseDescription: "Success. Request accepted for processing",
        customerMessage: "Success. Request accepted for processing",
      };
    } catch (error) {
      console.error("STK Push error:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate payment",
      };
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestId - Checkout request ID from STK Push
   */
  async querySTKPushStatus(checkoutRequestId) {
    try {
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const accessToken = await this.getAccessToken();

      // In production, call actual M-Pesa query endpoint
      if (this.environment === "production") {
        const response = await axios.post(
          "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
          {
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        return {
          success: response.data.ResultCode === "0",
          resultCode: response.data.ResultCode,
          resultDesc: response.data.ResultDesc,
        };
      }

      // Mock response for development - simulate random success/failure
      const isSuccess = Math.random() > 0.2; // 80% success rate in mock

      return {
        success: isSuccess,
        resultCode: isSuccess ? "0" : "1",
        resultDesc: isSuccess
          ? "The service request is processed successfully."
          : "Payment cancelled by user",
      };
    } catch (error) {
      console.error("STK Push query error:", error);
      return {
        success: false,
        resultCode: "1",
        resultDesc: "Failed to query payment status",
      };
    }
  }

  /**
   * Validate M-Pesa callback data
   * @param {object} callbackData - Data from M-Pesa callback
   */
  validateCallback(callbackData) {
    try {
      const body = callbackData.Body?.stkCallback;

      if (!body) {
        return { valid: false, error: "Invalid callback format" };
      }

      const resultCode = body.ResultCode;
      const resultDesc = body.ResultDesc;
      const checkoutRequestId = body.CheckoutRequestID;
      const merchantRequestId = body.MerchantRequestID;

      // Extract callback metadata
      const metadata = {};
      if (body.CallbackMetadata?.Item) {
        body.CallbackMetadata.Item.forEach((item) => {
          metadata[item.Name] = item.Value;
        });
      }

      return {
        valid: true,
        success: resultCode === 0,
        resultCode,
        resultDesc,
        checkoutRequestId,
        merchantRequestId,
        amount: metadata.Amount,
        mpesaReceiptNumber: metadata.MpesaReceiptNumber,
        transactionDate: metadata.TransactionDate,
        phoneNumber: metadata.PhoneNumber,
      };
    } catch (error) {
      return { valid: false, error: "Callback validation failed" };
    }
  }
}

export default new MpesaService();
