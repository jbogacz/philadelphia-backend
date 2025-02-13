import { FileStorage } from '../../common/file.storage';
import { AdCreative } from './ad.types';

export class CreativeService {
  constructor(private readonly fileStorage: FileStorage) {}

  async findCreative(publisherId: string): Promise<AdCreative> {
    // const fileUrl = await this.fileStorage.resolveFileUrl('istockphoto-92330978-2048x2048.jpg');
    const creative = {
      creativeId: 'creative-1',
      creativeUrl: "fileUrl",
      campaignId: 'campaign-1',
      advertiserId: 'advertiser-1',
    };
    return creative;
  }
}
