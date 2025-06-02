import { DynamoDbAdapter } from "../../shared/dynamoDbAdapter";
import { config } from '../config';
const dynamoDbAdapter = new DynamoDbAdapter();

export async function persistTour(object) {
    const result = await dynamoDbAdapter.putItemFromObjet(config.toursTableName, object);
    return result;
}
