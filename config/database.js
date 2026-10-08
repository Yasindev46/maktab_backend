import mongoose from 'mongoose';

async function removeLegacyExpenseSerialIndex() {
  const [expensesCollection] = await mongoose.connection.db
    .listCollections({ name: 'expenses_records' }, { nameOnly: true })
    .toArray();
  if (!expensesCollection) return;

  const collection = mongoose.connection.collection('expenses_records');
  const indexes = await collection.indexes();
  const legacyIndex = indexes.find((index) => (
    index.unique
    && Object.keys(index.key).length === 1
    && index.key.sr === 1
  ));

  if (legacyIndex) {
    await collection.dropIndex(legacyIndex.name);
    console.log(`Removed obsolete expenses index: ${legacyIndex.name}`);
  }
}

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await removeLegacyExpenseSerialIndex();
  console.log('Connected to database');
};

export default connectDB;