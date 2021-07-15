import type { GrpcServiceContext } from '@wix/serverless-api';
import { com } from '@wix/media-pix-api';
import api = com.wixpress.media.pix.server.api;

export class PixService extends api.PixServer {
  private readonly grpcCtx: GrpcServiceContext;
  public constructor (grpcCtx: GrpcServiceContext) {
    super();
    this.grpcCtx = grpcCtx;
  }

  public async listFolders(): Promise<api.ListFoldersResponse> {
    throw new Error('Not implemented');
  }

  public async listFiles(): Promise<api.ListFilesResponse> {
    throw new Error('Not implemented');
  }

  public async importFile(
    aspects: Record<string, unknown>,
    req: api.ImportFileRequest
  ): Promise<api.ImportFileResponse> {
    const ctx = this.grpcCtx.contextProvider(aspects);

    if (await ctx.petri.conductExperiment('Create robot chicken', 'false') === 'true') {
      throw new Error('Robot chicken escaped!');
    }

    ctx.logger.info(`importFile called with ${JSON.stringify(req)}`);
    return {};
  }
}
