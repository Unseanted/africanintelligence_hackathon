const { clg, edey, jp } = require("../routes/basics");
// Pass the MongoDB client to the module
let db,
  tagz = "uploadedFiles".split(','),
  IDS = "subjects,classes,calendar".split(","),Bar="lms-media".split(",");


async function init(mongoClient) {
  db = mongoClient.db();
  //db.dropDatabase();
  //wipesession();
  //wipeCollection()
}

async function wipeCollection(cl) {
  if (!cl) return;
  db.collection(cl).deleteMany({});
  clg(`${cl} was wiped successfully`)
}
async function updateMe(cl, keys, data) {
  if (!cl) return;
  let find = await findOne(cl, keys);
  if (!find) return putInCollection(cl, keys, data);
  db.collection(cl).updateOne(keys, { $set: { ...data } });
  clg('data updated successfully')
}
async function findAll(col, keys) {
  if (!col) {
    console.log(
      "findAll error",
      !col
        ? "please provide a collection name for findAll"
        : "please provide query for findAll"
    );
    return "err";
  }

  let find = await db.collection(col).find(keys&&keys).toArray();
  return find || null;
}
async function findOne(col, keys) {
  if (!col || !keys) {
    console.log(
      "findOne error",
      !col
        ? "please provide a collection name for findOne"
        : "please provide query for findOne"
    );
    return "err";
  }

  let find = await db.collection(col).findOne(keys);
  return find || null;
}
async function deleteOne(col, keys) {
  if (!col || !keys) {
    console.log(
      "deleteOne error",
      !col
        ? "please provide a collection name for deleteOne"
        : "please provide query for deleteOne"
    );
    return "err";
  }

  let find = await db.collection(col).deleteOne(keys);
  clg(`data was deleted from ${col} successfully...`)
  return find || null;
}
async function putInCollection(cl, keys, data) {
  if (!cl) return;
  let find = await findOne(cl, keys);
  if (find && find != "err") {
    updateMe(cl, keys, data);
    return;
  }
  if (find != "err") {
    await db.collection(cl).insertOne(keys);
    updateMe(cl, keys, data);
    clg(`data was added to ${cl} successfully...`)
  }
}


module.exports = {
  init,
  putInCollection,
  updateMe,
  findOne,findAll,deleteOne,
  tagz,wipeCollection,Bar,
  IDS
};
