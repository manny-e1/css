import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listProjectsAction } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function ProfessionalDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user has professional role
  if (session.user.role !== "professional" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const projects = await listProjectsAction();
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Professional Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session.user.name}! Manage your projects and materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {projects.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {recentProjects.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Projects this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">0</div>
            <p className="text-sm text-gray-600 mt-1">Materials in projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link href="/projects/new">
            <Button>Create New Project</Button>
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>{project.projectType}</div>
                    <div>{project.floorArea} m²</div>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link href="/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/projects" className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Projects
              </Button>
            </Link>
            <Link href="/materials" className="block">
              <Button variant="outline" className="w-full justify-start">
                Browse Materials
              </Button>
            </Link>
            <Link href="/projects/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                Create New Project
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/help" className="block">
              <Button variant="outline" className="w-full justify-start">
                Help Center
              </Button>
            </Link>
            <Link href="/tutorials" className="block">
              <Button variant="outline" className="w-full justify-start">
                Video Tutorials
              </Button>
            </Link>
            <Link href="/contact" className="block">
              <Button variant="outline" className="w-full justify-start">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
