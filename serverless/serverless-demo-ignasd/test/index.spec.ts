import { app } from '@wix/serverless-testkit';
import axios from 'axios';

describe('hello, serverless', () => {
  const testkit = app({});
  testkit.beforeAndAfter(10000);

  it('should say hello', async () => {
    const result = await axios.get(testkit.getUrl('/hello'));
    expect(result.data).toStrictEqual('hello, serverless');
    const biEvents = testkit.bi.events;
    expect(biEvents).toContainEqual({evid: 420, message: 'Something nice has happened', src: 42});
  });

  it('should check permissions', async () => {
    const resultWithoutPerms = await axios.get(testkit.getUrl('/restricted'), {
      validateStatus: () => true,
    });
    expect(resultWithoutPerms.status).toStrictEqual(403);

    const headers = testkit.apiGwTestkit
      .callContextBuilder()
      .withPermission('multipass')
      .headers();
    const resultWithPerms = await axios.get(testkit.getUrl('/restricted'), {
      headers: headers,
    });
    expect(resultWithPerms.status).toStrictEqual(200);
    expect(resultWithPerms.data).toStrictEqual('Yippee ki-yay!');
  });
});
