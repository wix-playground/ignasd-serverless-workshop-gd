import type { FunctionsBuilder } from '@wix/serverless-api';
import { FullHttpResponse } from '@wix/serverless-api';
import { MsmServer } from '@wix/ambassador-msm-server/rpc';

module.exports = function builder (builder: FunctionsBuilder) {
  return builder
    .addWebFunction('GET', '/hello', async (ctx) => {
      ctx.logger.info('Hello called');
      ctx.metrics.meter('hello')(1);
      return new FullHttpResponse({ status: 200, body: 'hello, serverless' });
    })
    .addWebFunction('GET', '/isfree/:sitename', async (ctx, req) => {
      const msmServerClient = MsmServer().MetaSiteReadApi()(ctx.aspects);
      return await msmServerClient.isSiteNameFree({ siteName: req.params.sitename });
    });
};
