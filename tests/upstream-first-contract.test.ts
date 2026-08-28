import { readFile } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(process.cwd(), relativePath), "utf8")
}

describe("upstream-first feature contract", () => {
  test("CI and pre-commit mechanically validate receipts and reject missing ones", async () => {
    const precommit = await readRepoFile(".pre-commit-config.yaml")
    const workflow = await readRepoFile(".github/workflows/ci.yml")
    const schema = JSON.parse(
      await readRepoFile(".compound-engineering/schemas/upstream-basis.schema.json"),
    ) as Record<string, unknown>

    expect(precommit).toContain("python-jsonschema/check-jsonschema")
    expect(precommit).toContain("0.38.0")
    expect(precommit).toContain("upstream-basis.schema.json")
    expect(workflow).toContain("pre-commit run --all-files")
    expect(workflow).toContain("git diff --name-only")
    expect(workflow).toMatch(/\^\(skills\|src\)\//)
    expect(workflow).toContain("Behavior-bearing changes require a validated")

    expect(schema).toMatchObject({
      additionalProperties: false,
      required: expect.arrayContaining(["decision", "selected", "candidates", "verification"]),
    })
    const properties = schema.properties as Record<string, any>
    expect(properties.decision.enum).toEqual(["adopted", "forked"])
    expect(properties.verification.properties).toMatchObject({
      license_checked: { const: true },
      activity_checked: { const: true },
      tests_checked: { const: true },
    })
  })

  test("planning requires an adopted or forked basis and fails closed", async () => {
    const research = await readRepoFile("skills/ce-plan/references/research.md")
    const sections = await readRepoFile("skills/ce-plan/references/plan-sections.md")
    const finalReview = await readRepoFile("skills/ce-plan/references/final-review.md")

    expect(research).toContain("Upstream Basis")
    expect(research).toContain("adopted")
    expect(research).toContain("forked")
    expect(research).toContain("upstream-basis-required")
    expect(research).toMatch(/Rejecting candidates[\s\S]*not permission for greenfield implementation/)
    expect(research).toMatch(/feature work[\s\S]*tool-unavailable handling fails closed/i)

    expect(sections).toContain("change_class")
    expect(sections).toContain("upstream_basis")
    expect(sections).toMatch(/including `greenfield`[\s\S]*non-executable/)
    expect(finalReview).toContain("upstream_basis: adopted|forked")
    expect(finalReview).toContain("upstream-basis-required")
  })

  test("execution rejects feature prompts and plans that lack upstream evidence", async () => {
    const triage = await readRepoFile("skills/ce-work/references/input-triage.md")

    expect(triage).toMatch(/`feature` proceeds only when[\s\S]*`upstream_basis: adopted\|forked`/)
    expect(triage).toMatch(/legacy format cannot prove the Upstream Basis contract/)
    expect(triage).toMatch(/adds or materially extends product behavior[\s\S]*must route to `ce-plan`/)
    expect(triage).toContain("upstream-basis-required")
    expect(triage).toContain("There is no greenfield exception, justification, waiver, or user override")
  })
})

describe("single-lead execution contract", () => {
  test("permits no more than one implementation worker", async () => {
    const strategy = await readRepoFile("skills/ce-work/references/execution-strategy.md")

    expect(strategy).toContain("One lead context executing inline is the default")
    expect(strategy).toContain("At most one implementation worker may be active")
    expect(strategy).toContain("Parallel implementation, worker pools, agent teams, and autonomous fan-out are prohibited")
    expect(strategy).toContain("A cross-model worker still consumes the run's single implementation-worker slot")
    expect(strategy).not.toContain("Parallel dispatch of each independent dependency layer is the default")
    expect(strategy).not.toMatch(/3-5 workers/)
  })
})
