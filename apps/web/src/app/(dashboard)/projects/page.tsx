import { ProjectForm } from "@/features/projects/components/project-form";
import { ProjectList } from "@/features/projects/components/project-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <ProjectForm />
      <ProjectList />
    </div>
  );
}
