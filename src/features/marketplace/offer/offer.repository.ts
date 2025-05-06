import { BaseRepository } from "../../base.repository";
import { Offer } from "../marketplace.types";
import { Collection } from "mongodb";

export class OfferRepository extends BaseRepository<Offer> {
  constructor(collection: Collection<Offer>) {
    super(collection);
  }
}
