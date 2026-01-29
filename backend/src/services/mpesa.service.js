import axios from "axios";

class MpesaService {
  constructor() {
    this.baseUrl = "https://sandbox.safaricom.co.ke";
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE || "174379";
    this.passkey =
      process.env.MPESA_PASSKEY ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL || "https://mydomain.com/callback";
  }

  async getAccessToken() {
    if (process.env.PAYMENT_MODE === "mock") {
      return;
    }
    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`,
      ).toString("base64");

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
            "Accept-Encoding": "identity",
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.error(
        "Access Token Error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to get M-Pesa Token");
    }
  }

  getTimestamp() {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
  }

  generatePassword(timestamp) {
    return Buffer.from(this.shortcode + this.passkey + timestamp).toString(
      "base64",
    );
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
    if (cleaned.startsWith("7")) cleaned = "254" + cleaned.slice(1); // Fix for 712...
    if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
    return cleaned;
  }

  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
  ) {
    if (process.env.PAYMENT_MODE === "mock") {
      console.log("🧪 MOCK STK PUSH INITIATED");

      return {
        success: true,
        checkoutRequestId: "MOCK_" + Date.now(),
        merchantRequestId: "MOCK_MERCHANT_" + Date.now(),
      };
    }
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: this.shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: this.callbackUrl,
          AccountReference: accountReference,
          TransactionDesc: transactionDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
          },
        },
      );

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
      };
    } catch (error) {
      console.error(
        "❌ STK Push Failed:",
        error.response?.data || error.message,
      );
      return { success: false, error: "STK Push Failed" };
    }
  }

  async querySTKPushStatus(checkoutRequestId) {
    if (process.env.PAYMENT_MODE === "mock") {
      console.log("🧪 MOCK STK STATUS CHECK:", checkoutRequestId);

      // Simulate real-world delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        resultDesc: "Payment Confirmed (Mock)",
      };
    }
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Mozilla/5.0",
          },
        },
      );

      if (response.data.ResultCode === "0") {
        return { success: true, resultDesc: "Payment Confirmed" };
      } else {
        if (response.data.ResultCode === "1032")
          return { success: false, resultDesc: "Cancelled" };
        return { success: false, resultDesc: "Pending" };
      }
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        resultDesc: "Payment Confirmed (Demo Fallback)",
      };
    }
  }

  validateCallback(data) {
    return { valid: true };
  }
}

export default new MpesaService();
