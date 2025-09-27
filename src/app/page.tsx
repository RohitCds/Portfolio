async function getProjects() {
  const res = await fetch("http://localhost:3000/api/projects");
  return res.json();
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">My Portfolio</h1>
      <ul className="mt-4 space-y-2">
        {projects.map((p: any) => (
          <li key={p.id} className="border p-4 rounded">
            <h2 className="font-semibold">{p.title}</h2>
            <p>{p.description}</p>
            <a href={p.link} className="text-blue-600 underline">View Project</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
