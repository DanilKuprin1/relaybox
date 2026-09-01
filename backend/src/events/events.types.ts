/** Payload pushed to the dashboard when a webhook delivery is captured. */
export type RequestReceivedEvent = {
  type: 'request.received';
  webhookPublicId: string;
  requestPublicId: string;
  method: string;
  path: string;
  status: number;
  receivedAt: string;
};
