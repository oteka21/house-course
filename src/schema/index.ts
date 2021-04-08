import { buildSchemaSync, Resolver, Query } from "type-graphql";
import { ImageResolver } from "./image";
// import { HouseResolver } from "./house";
import { authChecker } from "./auth";
@Resolver()
class DummyResolver {
  @Query((_returns) => String)
  hello() {
    return "nice to meet you";
  }
}

export const schema = buildSchemaSync({
  resolvers: [DummyResolver, ImageResolver],
  emitSchemaFile: process.env.NODE_ENV === "development",
  authChecker,
});
