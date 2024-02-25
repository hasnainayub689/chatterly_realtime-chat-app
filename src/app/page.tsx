import { db } from '../lib/db';

export default async function Home() {
    await db.set('Hello', 'hello');

    return <div className="text-red-500">Hello</div>;
}
