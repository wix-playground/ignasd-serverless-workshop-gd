import { app } from '@wix/serverless-testkit';
import { createEmptyStore } from '@wix/wix-aspects';
import axios from 'axios';

import { PixService } from '../src/GrpcService'

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

  it('check grpc method', async () => {
    const grpcClient = testkit.grpcClient(PixService);

    await expect(grpcClient.importFile(createEmptyStore(),{})).resolves.toMatchObject({});

    testkit.petri.reset();
    testkit.petri.onConductExperiment(() => 'true');

    await expect(grpcClient.importFile(createEmptyStore(),{})).rejects.toMatchObject(
      { name: 'GrpcStatusError', _cause: { details: 'Robot chicken escaped!' } },
    )
  });
});
