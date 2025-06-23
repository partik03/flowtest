/**
 * Simple template engine for variable substitution
 * Replaces {{variable}} placeholders with actual values
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] || match;
  });
}

/**
 * Load template from file and render with variables
 */
export async function loadAndRenderTemplate(
  templatePath: string, 
  variables: Record<string, string>
): Promise<string> {
  const fs = await import('fs/promises');
  const template = await fs.readFile(templatePath, 'utf-8');
  return renderTemplate(template, variables);
} 