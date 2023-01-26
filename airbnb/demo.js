const { MongoClient } = require("mongodb");
// install Javascript(ES6) code snippets
async function main() {
  const uri =
    "mongodb+srv://demo:password321@cluster0.etw698f.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
    //----------
    //await deleteListingByName(client, "Ribeira Charming Duplex");
    //----------
    // await updateAllListingsToHavePropertyType(client);
    //----------
    // await upsertListingByName(client, "Cozu Cottage", {
    //   bedrooms: 2,
    //   bathrooms: 2,
    // });
    //----------
    // await updateListingByName(client, "Ribeira Charming Duplex", {
    //   bedrooms: 6,
    //   beds: 8,
    // });
    //----------
    // await findListingsWithMinimunBedroomsBathroomsAndMostRecentReviews(client, {
    //   minimumNumberOfBedrooms: 4,
    //   minimumNumberOfBathrooms: 2,
    //   maximumNumberOfResults: 5,
    // });
  } catch (error) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

//DeleteMany

async function deleteListingsScrapedBeforeDate(client, date) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteMany({ last_scraped: { $lt: date } });

  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

// DeleteOne
async function deleteListingByName(client, nameOfListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteOne({ name: nameOfListing });

  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

// UpdateMany
async function updateAllListingsToHavePropertyType(client) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateMany(
      {
        property_type: {
          $exists: false,
        },
      },
      {
        $set: { property_type: "Unknown" },
      }
    );

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated`);
}

//Upsert listing by name

async function upsertListingByName(client, nameOfListing, updateListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne(
      { name: nameOfListing },
      { $set: updateListing },
      { upsert: true }
    );

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} document(s) was/were updated`);
  }
}

//Update Listing

async function updateListingByName(client, nameOfListing, updateListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne({ name: nameOfListing }, { $set: updateListing });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document was/where updated`);
}

// Listing multiple elements
async function findListingsWithMinimunBedroomsBathroomsAndMostRecentReviews(
  client,
  {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER,
  } = {}
) {
  const cursor = client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minimumNumberOfBedrooms },
      bathrooms: { $gte: minimumNumberOfBathrooms },
    })
    .sort({ last_review: -1 })
    .limit(maximumNumberOfResults);

  const results = await cursor.toArray();

  if (results.length > 0) {
    console.log(
      `Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`
    );
    results.forEach((result, i) => {
      date = new Date(result.last_review).toDateString();
      console.log();
      console.log(`${i + 1}. name: ${result.name}`);
      console.log(`   _id: ${result._id}`);
      console.log(`   bedrooms: ${result.bedrooms}`);
      console.log(`   bathrooms: ${result.bathrooms}`);
      console.log(
        `   most recent review date: ${new Date(
          result.last_review
        ).toDateString()}`
      );
    });
  } else {
    console.log(
      `No listings found at least: ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`
    );
  }
}
