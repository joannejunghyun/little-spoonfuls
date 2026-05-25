export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { register } = await import("@arizeai/phoenix-otel");
    const { AnthropicInstrumentation } = await import(
      "@arizeai/openinference-instrumentation-anthropic"
    );

    register({
      projectName: "little-spoonfuls",
      instrumentations: [new AnthropicInstrumentation()],
    });
  }
}
