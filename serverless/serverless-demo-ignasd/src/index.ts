import type { FunctionsBuilder } from '@wix/serverless-api';
import { FullHttpResponse } from '@wix/serverless-api';
import { MsmServer } from '@wix/ambassador-msm-server';

module.exports = function builder (builder: FunctionsBuilder) {
  return builder
    .addWebFunction('GET', '/hello', async () => new FullHttpResponse({ status: 200, body: 'hello, serverless' }))
    .addWebFunction('GET', '/isfree/:sitename', async (ctx, req) => {
      const msmServerClient = MsmServer().MetaSiteReadApi()(ctx.aspects);
      return await msmServerClient.isSiteNameFree({ siteName: req.params.sitename });
    });
};
