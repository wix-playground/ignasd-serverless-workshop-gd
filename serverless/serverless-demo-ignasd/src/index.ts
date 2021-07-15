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
      await ctx.greyhound.produce('serverless-demo-topic-1', {
        msg: `/isfree for ${String(req.params.sitename)} called`,
      });
      const msmServerClient = MsmServer().MetaSiteReadApi()(ctx.aspects);
      return await msmServerClient.isSiteNameFree({ siteName: req.params.sitename });
    })
    .addGreyhoundConsumer('serverless-demo-topic-1', async (ctx, msg) => {
      ctx.logger.info('Got message in "serverless-demo-topic-1"', msg);
    });
};
