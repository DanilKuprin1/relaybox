export type RequestReceivedEvent = {
  type: 'request.received';
  webhookPublicId: string;
  requestPublicId: string;
  method: string;
  path: string;
  status: number;
  receivedAt: string;
};
