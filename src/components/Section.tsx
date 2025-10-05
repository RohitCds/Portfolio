export default function Page() {
    return (
        <main className="ml-52"> {/* leave space for sidebar */}
            <section id="home" className="h-screen bg-black text-white flex items-center justify-center">
                <h1>Home Section</h1>
            </section>

            <section id="about" className="h-screen bg-gray-800 text-white flex items-center justify-center">
                <h1>About Section</h1>
            </section>

            <section id="skills" className="h-screen bg-gray-700 text-white flex items-center justify-center">
                <h1>Skills Section</h1>
            </section>

            <section id="projects" className="h-screen bg-gray-600 text-white flex items-center justify-center">
                <h1>Projects Section</h1>
            </section>

            <section id="contact" className="h-screen bg-gray-500 text-white flex items-center justify-center">
                <h1>Contact Section</h1>
            </section>
        </main>
    );
}