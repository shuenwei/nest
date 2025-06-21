import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import dotenv from "dotenv";
dotenv.config();

const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT!;
const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY!;

const client = DocumentIntelligence(endpoint, {
  key: apiKey,
});

export async function processReceipt(imageUrl: string): Promise<{
  restaurantName: string;
  items: { name: string; price: string }[];
}> {
  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-receipt")
    .post({
      contentType: "application/json",
      body: {
        urlSource: imageUrl,
      },
    });

  if (isUnexpected(initialResponse)) {
    throw initialResponse.body.error;
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const result = await poller.pollUntilDone();
  const analyzeResult = (result.body as any).analyzeResult;

  const documents = analyzeResult?.documents;
  const receiptDoc = documents?.[0];

  if (!receiptDoc || !receiptDoc.fields) {
    throw new Error("Expected at least one receipt in the result.");
  }

  const { MerchantName, Items } = receiptDoc.fields;

  const restaurantName = MerchantName?.valueString ?? "Unknown Restaurant";
  const items: { name: string; price: string }[] = [];

  if (Items?.valueArray) {
    for (const itemField of Items.valueArray) {
      const item = itemField.valueObject;
      const name = item?.Description?.valueString ?? "Unknown Item";
      const amount = item?.TotalPrice?.valueCurrency?.amount;
      const price = typeof amount === "number" ? amount.toFixed(2) : "0.00";
      items.push({ name, price });
    }
  }

  return { restaurantName, items };
}

export async function processReceiptFromBuffer(buffer: Buffer): Promise<{
  restaurantName: string;
  items: { name: string; price: string }[];
}> {
  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-receipt")
    .post({
      contentType: "image/jpeg",
      body: buffer,
    });

  if (isUnexpected(initialResponse)) {
    throw initialResponse.body.error;
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const result = await poller.pollUntilDone();
  const analyzeResult = (result.body as any).analyzeResult;

  const documents = analyzeResult?.documents;
  const receiptDoc = documents?.[0];

  if (!receiptDoc || !receiptDoc.fields) {
    throw new Error("Expected at least one receipt in the result.");
  }

  const { MerchantName, Items } = receiptDoc.fields;

  const restaurantName = MerchantName?.valueString ?? "Unknown Restaurant";
  const items: { name: string; price: string }[] = [];

  if (Items?.valueArray) {
    for (const itemField of Items.valueArray) {
      const item = itemField.valueObject;
      const name = item?.Description?.valueString ?? "Unknown Item";
      const amount = item?.TotalPrice?.valueCurrency?.amount;
      const price = typeof amount === "number" ? amount.toFixed(2) : "0.00";
      items.push({ name, price });
    }
  }

  return { restaurantName, items };
}
