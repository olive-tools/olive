import { DynamoDbAdapter } from '../../shared/dynamoDbAdapter';

export async function retrieveTourAtvs(tourDate) {
    const adapter = new DynamoDbAdapter();
    const tourAtvs = await adapter.getByPKAsJson('ga-tours-atv', { tourDate });
    return tourAtvs;
}
