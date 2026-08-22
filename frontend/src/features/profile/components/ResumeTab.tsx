import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ResumeTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Professional Summary</CardTitle>
          <Button variant="outline" size="sm">Edit</Button>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">
            Software Engineer with 5+ years of experience in building scalable web applications.
            Proficient in React, Node.js, and cloud technologies.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button variant="outline" size="sm">Add Experience</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-2 border-primary-500 pl-4 pb-4">
            <h4 className="font-medium text-text-main">Senior Frontend Developer</h4>
            <p className="text-sm text-text-secondary">DayFlow Inc. • 2023 - Present</p>
            <p className="text-sm mt-2 text-text-main">
              Leading the frontend development of the core HRMS platform using React and TypeScript.
            </p>
          </div>
          <div className="border-l-2 border-neutral-200 pl-4">
            <h4 className="font-medium text-text-main">Frontend Developer</h4>
            <p className="text-sm text-text-secondary">Tech Solutions • 2020 - 2023</p>
            <p className="text-sm mt-2 text-text-main">
              Developed user interfaces for various client projects.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Button variant="outline" size="sm">Edit</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'AWS'].map((skill) => (
              <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
