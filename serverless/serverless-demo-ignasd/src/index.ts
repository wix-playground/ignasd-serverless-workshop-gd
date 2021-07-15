import type { FunctionsBuilder, KVItem } from '@wix/serverless-api';
import { FullHttpResponse, HttpError } from '@wix/serverless-api';
import { MsmServer } from '@wix/ambassador-msm-server/rpc';

import { PixService } from './GrpcService'

interface SiteNameChecked extends KVItem {
  timesChecked: number
}

module.exports = function builder (builder: FunctionsBuilder) {
  return builder
    .addWebFunction('GET', '/hello', async (ctx) => {
      ctx.logger.info('Hello called');
      ctx.metrics.meter('hello')(1);
      const biEvent = { evid: 420, message: 'Something nice has happened' };
      await ctx.biLogger.log(biEvent);
      return new FullHttpResponse({ status: 200, body: 'hello, serverless' });
    })

    .addWebFunction('GET', '/isfree/:sitename', async (ctx, req) => {
      const { sitename } = req.params;
      
      await ctx.greyhound.produce('serverless-demo-topic-1', {
        msg: `/isfree for ${String(sitename)} called`,
      });

      await ctx.cloudStore.keyValueStore.getAndUpdate<SiteNameChecked>(
        sitename,
        (counter) => {
          if (typeof counter?.timesChecked === 'number') {
            return {
              key: sitename,
              timesChecked: counter.timesChecked + 1,
            };
          }
          return {
            key: sitename,
            timesChecked: 0,
          };
        },
      );

      const msmServerClient = MsmServer().MetaSiteReadApi()(ctx.aspects);
      return await msmServerClient.isSiteNameFree({ siteName: req.params.sitename });
    })

    .addGreyhoundConsumer('serverless-demo-topic-1', async (ctx, msg) => {
      ctx.logger.info('Got message in "serverless-demo-topic-1"', msg);
    })

    .addWebFunction('GET', '/restricted', async (ctx) => {
      const passed: boolean = await ctx.apiGatewayClient.isPermitted('multipass');
      if (passed) {
        return 'Yippee ki-yay!';
      }
      throw new HttpError({
        status: 403,
        message: 'Nope',
      });
    })

    .addGrpcService(PixService)

    .withBiInfo({ src: 42 });
};
