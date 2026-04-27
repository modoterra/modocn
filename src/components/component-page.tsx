import { Link } from "react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

import type { ReactNode } from "react"

type PropDef = {
  name: string
  type: string
  description: string
  default?: string
}

type ExportDef = {
  name: string
  kind: "component" | "hook" | "function" | "type" | "constant" | "context"
  description: string
}

type ExampleDef = {
  title: string
  description?: string
  code: string
}

type ComponentPageProps = {
  name: string
  registry: string
  description: string
  features?: string[]
  props?: PropDef[]
  exports?: ExportDef[]
  examples?: ExampleDef[]
  children?: ReactNode
  prev?: { label: string; href: string }
  next?: { label: string; href: string }
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code>
      {children}
    </code>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="overflow-x-auto p-4"
    >
      <code className="whitespace-pre">{children}</code>
    </pre>
  )
}

export function ComponentPage({
  name,
  registry,
  description,
  features,
  props,
  exports,
  examples,
  children,
  prev,
  next,
}: ComponentPageProps) {
  return (
    <div>
      <h1 className="m-0">{name}</h1>
      <p className="mt-3">
        registry: {registry}
      </p>
      <p className="mt-4 max-w-3xl">
        {description}
      </p>

      <section className="mt-10">
        <h2 className="mb-4">Installation</h2>
        <CodeBlock>
          {`npx shadcn add https://modocn.mdtrr.com/r/${registry}.json`}
        </CodeBlock>
      </section>

      {features && features.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4">Features</h2>
          <ul className="list-disc space-y-7 pl-5">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {children && (
        <section className="mt-10">
          {children}
        </section>
      )}

      {props && props.length > 0 && (
        <section className="mt-10">
          <Accordion type="single" collapsible defaultValue="props">
            <AccordionItem value="props">
              <AccordionTrigger className="py-0 pb-14">
                Props
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead className="h-16">Name</TableHead>
                       <TableHead className="h-16">Type</TableHead>
                       <TableHead className="h-16">Default</TableHead>
                       <TableHead className="h-16">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {props.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell className="py-8 align-top whitespace-nowrap">
                          <InlineCode>{p.name}</InlineCode>
                        </TableCell>
                        <TableCell className="py-8 align-top whitespace-nowrap">
                          {p.type}
                        </TableCell>
                        <TableCell className="py-8 align-top whitespace-nowrap">
                          {p.default ?? "—"}
                        </TableCell>
                        <TableCell className="py-8 align-top">
                          {p.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}

      {exports && exports.length > 0 && (
        <section className="mt-10">
          <Accordion type="single" collapsible defaultValue="exports">
            <AccordionItem value="exports">
              <AccordionTrigger className="py-0 pb-14">
                Exports
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead className="h-16">Name</TableHead>
                       <TableHead className="h-16">Kind</TableHead>
                       <TableHead className="h-16">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exports.map((e) => (
                      <TableRow key={e.name}>
                        <TableCell className="py-8 align-top whitespace-nowrap">
                          <InlineCode>{e.name}</InlineCode>
                        </TableCell>
                        <TableCell className="py-8 align-top">
                          {e.kind}
                        </TableCell>
                        <TableCell className="py-8 align-top">
                          {e.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}

      {examples && examples.length > 0 && (
        <section className="mt-32">
          <h2 className="mb-14">Examples</h2>
          <div className="flex flex-col gap-24">
            {examples.map((ex) => (
              <div key={ex.title}>
                <h3 className="mb-8">{ex.title}</h3>
                {ex.description && (
                  <p className="mb-10 max-w-[48rem]">
                    {ex.description}
                  </p>
                )}
                <CodeBlock>{ex.code}</CodeBlock>
              </div>
            ))}
          </div>
        </section>
      )}

      <Separator className="mt-36" />

      <nav className="flex flex-wrap justify-between gap-4 py-18">
        {prev ? (
          <Link to={prev.href}>&larr; {prev.label}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.href}>{next.label} &rarr;</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
