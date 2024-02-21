import type {
  ChartNode,
  ChatMessage,
  ChatMessageMessagePart,
  EditorDefinition,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Rivet,
} from "@ironclad/rivet-core";
import { match } from "ts-pattern";

export type OllamaGenerateNodeData = {
  model: string;
  useModelInput?: boolean;

  promptFormat: string;

  jsonMode: boolean;

  outputFormat: string;

  advancedOutputs: boolean;

  // PARAMETERS

  mirostat?: number;
  useMirostatInput?: boolean;

  mirostatEta?: number;
  useMirostatEtaInput?: boolean;

  mirostatTau?: number;
  useMirostatTauInput?: boolean;

  numCtx?: number;
  useNumCtxInput?: boolean;

  numGqa?: number;
  useNumGqaInput?: boolean;

  numGpu?: number;
  useNumGpuInput?: boolean;

  numThread?: number;
  useNumThreadInput?: boolean;

  repeatLastN?: number;
  useRepeatLastNInput?: boolean;

  repeatPenalty?: number;
  useRepeatPenaltyInput?: boolean;

  temperature?: number;
  useTemperatureInput?: boolean;

  seed?: number;
  useSeedInput?: boolean;

  stop: string;
  useStopInput?: boolean;

  tfsZ?: number;
  useTfsZInput?: boolean;

  numPredict?: number;
  useNumPredictInput?: boolean;

  topK?: number;
  useTopKInput?: boolean;

  topP?: number;
  useTopPInput?: boolean;

  additionalParameters?: { key: string; value: string }[];
  useAdditionalParametersInput?: boolean;
};

export type OllamaGenerateNode = ChartNode<"ollamaChat", OllamaGenerateNodeData>;

type OllamaStreamingContentResponse = {
  model: string;
  created_at: string;
  done: false;
  response: string;
};

type OllamaStreamingFinalResponse = {
  model: string;
  created_at: string;
  response: "";
  done: true;
  total_duration: number;
  load_duration: number;
  sample_count?: number;
  sample_duration?: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
  context: number[];
};

type OllamaStreamingGenerateResponse =
  | OllamaStreamingContentResponse
  | OllamaStreamingFinalResponse;

export const ollamaChat = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<OllamaGenerateNode> = {
    create(): OllamaGenerateNode {
      const node: OllamaGenerateNode = {
        id: rivet.newId<NodeId>(),
        data: {
          model: "",
          useModelInput: false,
          promptFormat: "auto",
          jsonMode: false,
          outputFormat: "",
          numPredict: 1024,
          advancedOutputs: false,
          stop: "",
        },
        title: "Ollama Generate",
        type: "ollamaChat",
        visualData: {
          x: 0,
          y: 0,
          width: 250,
        },
      };
      return node;
    },

    getInputDefinitions(data): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      inputs.push({
        id: "system-prompt" as PortId,
        dataType: "string",
        title: "System Prompt",
        description: "The system prompt to prepend to the messages list.",
        required: false,
        coerced: true,
      });

      inputs.push({
        id: "messages" as PortId,
        dataType: ["chat-message[]", "chat-message"],
        title: "Messages",
        description: "The chat messages to use as the prompt.",
      });

      if (data.useModelInput) {
        inputs.push({
          id: "model" as PortId,
          dataType: "string",
          title: "Model",
        });
      }

      if (data.useMirostatInput) {
        inputs.push({
          id: "mirostat" as PortId,
          dataType: "number",
          title: "Mirostat",
          description: 'The "mirostat" parameter.',
        });
      }

      if (data.useMirostatEtaInput) {
        inputs.push({
          id: "mirostatEta" as PortId,
          dataType: "number",
          title: "Mirostat Eta",
          description: 'The "mirostat_eta" parameter.',
        });
      }

      if (data.useMirostatTauInput) {
        inputs.push({
          id: "mirostatTau" as PortId,
          dataType: "number",
          title: "Mirostat Tau",
          description: 'The "mirostat_tau" parameter.',
        });
      }

      if (data.useNumCtxInput) {
        inputs.push({
          id: "numCtx" as PortId,
          dataType: "number",
          title: "Num Ctx",
          description: 'The "num_ctx" parameter.',
        });
      }

      if (data.useNumGqaInput) {
        inputs.push({
          id: "numGqa" as PortId,
          dataType: "number",
          title: "Num GQA",
          description: 'The "num_gqa" parameter.',
        });
      }

      if (data.useNumGpuInput) {
        inputs.push({
          id: "numGpu" as PortId,
          dataType: "number",
          title: "Num GPUs",
          description: 'The "num_gpu" parameter.',
        });
      }

      if (data.useNumThreadInput) {
        inputs.push({
          id: "numThread" as PortId,
          dataType: "number",
          title: "Num Threads",
          description: 'The "num_thread" parameter.',
        });
      }

      if (data.useRepeatLastNInput) {
        inputs.push({
          id: "repeatLastN" as PortId,
          dataType: "number",
          title: "Repeat Last N",
          description: 'The "repeat_last_n" parameter.',
        });
      }

      if (data.useRepeatPenaltyInput) {
        inputs.push({
          id: "repeatPenalty" as PortId,
          dataType: "number",
          title: "Repeat Penalty",
          description: 'The "repeat_penalty" parameter.',
        });
      }

      if (data.useTemperatureInput) {
        inputs.push({
          id: "temperature" as PortId,
          dataType: "number",
          title: "Temperature",
          description: 'The "temperature" parameter.',
        });
      }

      if (data.useSeedInput) {
        inputs.push({
          id: "seed" as PortId,
          dataType: "number",
          title: "Seed",
          description: 'The "seed" parameter.',
        });
      }

      if (data.useStopInput) {
        inputs.push({
          id: "stop" as PortId,
          dataType: "string[]",
          title: "Stop",
          description: 'The "stop" parameter.',
        });
      }

      if (data.useTfsZInput) {
        inputs.push({
          id: "tfsZ" as PortId,
          dataType: "number",
          title: "TFS Z",
          description: 'The "tfs_z" parameter.',
        });
      }

      if (data.useNumPredictInput) {
        inputs.push({
          id: "numPredict" as PortId,
          dataType: "number",
          title: "Num Predict",
          description: 'The "num_predict" parameter.',
        });
      }

      if (data.useTopKInput) {
        inputs.push({
          id: "topK" as PortId,
          dataType: "number",
          title: "Top K",
          description: 'The "top_k" parameter.',
        });
      }

      if (data.useTopPInput) {
        inputs.push({
          id: "topP" as PortId,
          dataType: "number",
          title: "Top P",
          description: 'The "top_p" parameter.',
        });
      }

      return inputs;
    },

    getOutputDefinitions(data): NodeOutputDefinition[] {
      let outputs: NodeOutputDefinition[] = [
        {
          id: "output" as PortId,
          dataType: "string",
          title: "Output",
          description: "The output from Ollama.",
        },
        {
          id: "prompt" as PortId,
          dataType: "string",
          title: "Prompt",
          description:
            "The full prompt, with formattting, that was sent to Ollama.",
        },
        {
          id: "messages-sent" as PortId,
          dataType: "chat-message[]",
          title: "Messages Sent",
          description:
            "The messages sent to Ollama, including the system prompt.",
        },
        {
          id: "all-messages" as PortId,
          dataType: "chat-message[]",
          title: "All Messages",
          description: "All messages, including the reply from Ollama.",
        },
      ];

      if (data.advancedOutputs) {
        outputs = [
          ...outputs,
          {
            id: "total-duration" as PortId,
            dataType: "number",
            title: "Total Duration",
            description: "Time spent generating the response",
          },
          {
            id: "load-duration" as PortId,
            dataType: "number",
            title: "Load Duration",
            description: "Time spent in nanoseconds loading the model",
          },
          {
            id: "sample-count" as PortId,
            dataType: "number",
            title: "Sample Count",
            description: "Number of samples generated",
          },
          {
            id: "sample-duration" as PortId,
            dataType: "number",
            title: "Sample Duration",
            description: "Time spent generating samples",
          },
          {
            id: "prompt-eval-count" as PortId,
            dataType: "number",
            title: "Prompt Eval Count",
            description: "Number of tokens in the prompt",
          },
          {
            id: "prompt-eval-duration" as PortId,
            dataType: "number",
            title: "Prompt Eval Duration",
            description: "Time spend in nanoseconds evaluating the prompt",
          },
          {
            id: "eval-count" as PortId,
            dataType: "number",
            title: "Eval Count",
            description: "Number of tokens in the response",
          },
          {
            id: "eval-duration" as PortId,
            dataType: "number",
            title: "Eval Duration",
            description: "Time in nanoseconds spent generating the response",
          },
          {
            id: "tokens-per-second" as PortId,
            dataType: "number",
            title: "Tokens Per Second",
            description: "Tokens generated per second",
          },
          {
            id: "parameters" as PortId,
            dataType: "object",
            title: "Parameters",
            description: "The parameters sent to Ollama",
          },
        ];
      }

      return outputs;
    },

    getEditors(): EditorDefinition<OllamaGenerateNode>[] {
      return [
        {
          type: "string",
          dataKey: "model",
          label: "Model",
          useInputToggleDataKey: "useModelInput",
          helperMessage: "The LLM model to use in Ollama.",
        },
        {
          type: "dropdown",
          dataKey: "promptFormat",
          label: "Prompt Format",
          options: [
            { value: "auto", label: "Auto"},
            { value: "", label: "Raw" },
            { value: "llama2", label: "Llama 2 Instruct" },
          ],
          defaultValue: "",
          helperMessage: "The way to format chat messages for the prompt being sent to the ollama model. Raw means no formatting is applied. Auto means ollama will take care of it."
        },
        {
          type: "toggle",
          dataKey: "jsonMode",
          label: "JSON mode",
          helperMessage: "Activates Ollamas JSON mode. Make sure to also instruct the model to return JSON"
        },
        {
          type: "number",
          dataKey: "numPredict",
          useInputToggleDataKey: "useNumPredictInput",
          label: "maxTokens (num Predict)",
          helperMessage:
            "The maximum number of tokens to generate in the chat completion.",
          allowEmpty: false,
          defaultValue: 1024,
        },
        {
          type: "toggle",
          dataKey: "advancedOutputs",
          label: "Advanced Outputs",
          helperMessage:
            "Add additional outputs with detailed information about the Ollama execution.",
        },
        {
          type: "group",
          label: "Parameters",
          editors: [
            {
              type: "number",
              dataKey: "mirostat",
              useInputToggleDataKey: "useMirostatInput",
              label: "Mirostat",
              helperMessage:
                "Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)",
              min: 0,
              max: 1,
              step: 1,
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "mirostatEta",
              useInputToggleDataKey: "useMirostatEtaInput",
              label: "Mirostat Eta",
              helperMessage:
                "Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "mirostatTau",
              useInputToggleDataKey: "useMirostatTauInput",
              label: "Mirostat Tau",
              helperMessage:
                "Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "numCtx",
              useInputToggleDataKey: "useNumCtxInput",
              label: "Num Ctx",
              helperMessage:
                "Sets the size of the context window used to generate the next token. (Default: 2048)",

              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "numGqa",
              useInputToggleDataKey: "useNumGqaInput",
              label: "Num GQA",
              helperMessage:
                "The number of GQA groups in the transformer layer. Required for some models, for example it is 8 for llama2:70b",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "numGpu",
              useInputToggleDataKey: "useNumGpuInput",
              label: "Num GPUs",
              helperMessage:
                "The number of layers to send to the GPU(s). On macOS it defaults to 1 to enable metal support, 0 to disable.",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "numThread",
              useInputToggleDataKey: "useNumThreadInput",
              label: "Num Threads",
              helperMessage:
                "Sets the number of threads to use during computation. By default, Ollama will detect this for optimal performance. It is recommended to set this value to the number of physical CPU cores your system has (as opposed to the logical number of cores).",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "repeatLastN",
              useInputToggleDataKey: "useRepeatLastNInput",
              label: "Repeat Last N",
              helperMessage:
                "Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "repeatPenalty",
              useInputToggleDataKey: "useRepeatPenaltyInput",
              label: "Repeat Penalty",
              helperMessage:
                "Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "temperature",
              useInputToggleDataKey: "useTemperatureInput",
              label: "Temperature",
              helperMessage:
                "The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "seed",
              useInputToggleDataKey: "useSeedInput",
              label: "Seed",
              helperMessage:
                "Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)",
              allowEmpty: true,
            },
            {
              type: "string",
              dataKey: "stop",
              useInputToggleDataKey: "useStopInput",
              label: "Stop",
              helperMessage:
                "Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return.",
            },
            {
              type: "number",
              dataKey: "tfsZ",
              useInputToggleDataKey: "useTfsZInput",
              label: "TFS Z",
              helperMessage:
                "Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "numPredict",
              useInputToggleDataKey: "useNumPredictInput",
              label: "Num Predict",
              helperMessage:
                "Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "topK",
              useInputToggleDataKey: "useTopKInput",
              label: "Top K",
              helperMessage:
                "Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)",
              allowEmpty: true,
            },
            {
              type: "number",
              dataKey: "topP",
              useInputToggleDataKey: "useTopPInput",
              label: "Top P",
              helperMessage:
                "Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)",
              allowEmpty: true,
            },
            {
              type: "keyValuePair",
              dataKey: "additionalParameters",
              useInputToggleDataKey: "useAdditionalParametersInput",
              label: "Additional Parameters",
              keyPlaceholder: "Parameter",
              valuePlaceholder: "Value",
              helperMessage:
                "Additional parameters to pass to Ollama. Numbers will be parsed and sent as numbers, otherwise they will be sent as strings.",
            },
          ],
        },
      ];
    },

    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelInput ? "(From Input)" : data.model || "Unset!"}
        Format: ${data.promptFormat || "Raw"}
        Max tokens: ${data.numPredict || 1024}
      `;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Ollama Generate",
        group: "Ollama",
        infoBoxBody: "This is an Ollama Generate node using /api/generate.",
        infoBoxTitle: "Ollama Generate Node",
      };
    },

    async process(data, inputData, context) {
      let outputs: Outputs = {};

      const host = context.getPluginConfig("host") || "http://localhost:11434";

      if (!host.trim()) {
        throw new Error("No host set!");
      }

      const model = rivet.getInputOrData(data, inputData, "model", "string");
      if (!model) {
        throw new Error("No model set!");
      }

      const systemPrompt = rivet.coerceTypeOptional(
        inputData["system-prompt" as PortId],
        "string"
      );
      const messages =
        rivet.coerceTypeOptional(
          inputData["messages" as PortId],
          "chat-message[]"
        ) ?? [];
      const allMessages: ChatMessage[] = systemPrompt
        ? [{ type: "system", message: systemPrompt }, ...messages]
        : messages;

      const prompt = formatChatMessages(allMessages, data.promptFormat);

      let additionalParameters: Record<string, string | number> = (
        data.additionalParameters ?? []
      ).reduce((acc, { key, value }) => {
        const parsedValue = Number(value);
        acc[key] = isNaN(parsedValue) ? value : parsedValue;
        return acc;
      }, {} as Record<string, string | number>);

      if (data.useAdditionalParametersInput) {
        additionalParameters = (rivet.coerceTypeOptional(
          inputData["additionalParameters" as PortId],
          "object"
        ) ?? {}) as Record<string, string | number>;
      }

      let stop: string[] | undefined = undefined;
      if (data.useStopInput) {
        stop = rivet.coerceTypeOptional(
          inputData["stop" as PortId],
          "string[]"
        );
      } else {
        stop = data.stop ? [data.stop] : undefined;
      }

      const parameters = {
        mirostat: rivet.getInputOrData(data, inputData, "mirostat", "number"),
        mirostat_eta: rivet.getInputOrData(
          data,
          inputData,
          "mirostatEta",
          "number"
        ),
        mirostat_tau: rivet.getInputOrData(
          data,
          inputData,
          "mirostatTau",
          "number"
        ),
        num_ctx: rivet.getInputOrData(data, inputData, "numCtx", "number"),
        num_gqa: rivet.getInputOrData(data, inputData, "numGqa", "number"),
        num_gpu: rivet.getInputOrData(data, inputData, "numGpu", "number"),
        num_thread: rivet.getInputOrData(
          data,
          inputData,
          "numThread",
          "number"
        ),
        repeat_last_n: rivet.getInputOrData(
          data,
          inputData,
          "repeatLastN",
          "number"
        ),
        repeat_penalty: rivet.getInputOrData(
          data,
          inputData,
          "repeatPenalty",
          "number"
        ),
        temperature: rivet.getInputOrData(
          data,
          inputData,
          "temperature",
          "number"
        ),
        seed: rivet.getInputOrData(data, inputData, "seed", "number"),
        stop,
        tfs_z: rivet.getInputOrData(data, inputData, "tfsZ", "number"),
        num_predict: rivet.getInputOrData(
          data,
          inputData,
          "numPredict",
          "number"
        ),
        top_k: rivet.getInputOrData(data, inputData, "topK", "number"),
        top_p: rivet.getInputOrData(data, inputData, "topP", "number"),
        ...additionalParameters,
      };

      let apiResponse: Response;
      
      type RequestBodyType = {
        model: string;
        prompt: string;
        raw: boolean;
        stream: boolean;
        options: any;
        format?: string;
      };

      const requestBody: RequestBodyType = {
        model,
        prompt,
        raw: data.promptFormat === "auto" ? false : true,
        stream: true,
        options: parameters
      };
      if (data.jsonMode === true) {
        requestBody.format = "json";
      } // test
      
      try {
        apiResponse = await fetch(`${host}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
        });
      } catch (err) {
        throw new Error(`Error from Ollama: ${rivet.getError(err).message}`);
      }

      if (!apiResponse.ok) {
        try {
          const error = await apiResponse.json();
          throw new Error(`Error from Ollama: ${error.message}`);
        } catch (err) {
          throw new Error(`Error from Ollama: ${apiResponse.statusText}`);
        }
      }

      const reader = apiResponse.body?.getReader();

      if (!reader) {
        throw new Error("No response body!");
      }

      let streamingResponseText = "";
      let llmResponseText = "";

      let finalResponse: OllamaStreamingFinalResponse | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          const chunk = new TextDecoder().decode(value);

          streamingResponseText += chunk;

          const lines = streamingResponseText.split("\n");
          streamingResponseText = lines.pop() ?? "";

          for (const line of lines) {
            try {
              const json = JSON.parse(line) as OllamaStreamingGenerateResponse;

              if (!("done" in json)) {
                throw new Error(`Invalid response from Ollama: ${line}`);
              }

              if (!json.done) {
                if (llmResponseText === "") {
                  llmResponseText += (json.response as string).trimStart();
                } else {
                  llmResponseText += json.response;
                }
              } else {
                finalResponse = json;
              }
            } catch (err) {
              throw new Error(
                `Error parsing line from Ollama streaming response: ${line}`
              );
            }
          }

          outputs["output" as PortId] = {
            type: "string",
            value: llmResponseText,
          };

          context.onPartialOutputs?.(outputs);
        }
      }

      if (!finalResponse) {
        throw new Error("No final response from Ollama!");
      }

      outputs["prompt" as PortId] = {
        type: "string",
        value: prompt,
      };

      outputs["messages-sent" as PortId] = {
        type: "chat-message[]",
        value: allMessages,
      };

      outputs["all-messages" as PortId] = {
        type: "chat-message[]",
        value: [
          ...allMessages,
          {
            type: "assistant",
            message: llmResponseText,
            function_call: undefined,
          },
        ],
      };

      if (data.advancedOutputs) {
        outputs["total-duration" as PortId] = {
          type: "number",
          value: finalResponse.total_duration,
        };

        outputs["load-duration" as PortId] = {
          type: "number",
          value: finalResponse.load_duration,
        };

        outputs["sample-count" as PortId] = {
          type: "number",
          value: finalResponse.sample_count ?? 0,
        };

        outputs["sample-duration" as PortId] = {
          type: "number",
          value: finalResponse.sample_duration ?? 0,
        };

        outputs["prompt-eval-count" as PortId] = {
          type: "number",
          value: finalResponse.prompt_eval_count,
        };

        outputs["prompt-eval-duration" as PortId] = {
          type: "number",
          value: finalResponse.prompt_eval_duration,
        };

        outputs["eval-count" as PortId] = {
          type: "number",
          value: finalResponse.eval_count,
        };

        outputs["eval-duration" as PortId] = {
          type: "number",
          value: finalResponse.eval_duration,
        };

        outputs["tokens-per-second" as PortId] = {
          type: "number",
          value: finalResponse.eval_count / (finalResponse.eval_duration / 1e9),
        };

        outputs["parameters" as PortId] = {
          type: "object",
          value: parameters,
        };
      }

      return outputs;
    },
  };

  return rivet.pluginNodeDefinition(impl, "Ollama Chat");
};

function formatChatMessages(messages: ChatMessage[], format: string): string {
  return match(format)
    .with(
      "",
      () =>
        messages.map((message) => formatChatMessage(message, format)).join("\n") // Hopefully \n is okay? Instead of joining with empty string?
    )
    .with(
      "auto",
      () =>
        messages.map((message) => formatChatMessage(message, format)).join("\n")
    )
    .with("llama2", () => formatLlama2Instruct(messages))
    .otherwise(() => {
      throw new Error(`Unsupported format: ${format}`);
    });
}

function formatLlama2Instruct(messages: ChatMessage[]): string {
  let inMessage = false;
  let inInstruction = false;
  let prompt = "";

  for (const message of messages) {
    if (!inMessage) {
      prompt += "<s>";
      inMessage = true;
    }

    if (message.type === "system" || message.type === "user") {
      if (inInstruction) {
        prompt += "\n\n";
      } else {
        prompt += "[INST] ";
        inInstruction = true;
      }

      prompt += formatChatMessage(message, "llama2");
    } else if (message.type === "assistant") {
      if (inInstruction) {
        prompt += " [/INST] ";
        inInstruction = false;
      }

      prompt += formatChatMessage(message, "llama2");
      prompt += " </s>";
      inMessage = false;
    } else {
      throw new Error(`Unsupported message type: ${message.type}`);
    }
  }

  if (inInstruction) {
    prompt += "[/INST] ";
    inInstruction = false;
  }

  // Make sure there's always an unterminated <s> for the LLM to fill in itself
  if (!inMessage) {
    prompt += "<s>";
    inMessage = true;
  }

  return prompt;
}

function formatChatMessage(message: ChatMessage, format: string): string {
  return match(format)
    .with("", (): string => chatMessageToString(message.message))
    .with("llama2", (): string =>
      match(message)
        .with({ type: "user" }, (message) =>
          chatMessageToString(message.message)
        )
        .with(
          { type: "system" },
          (message) =>
            `<<SYS>>\n${chatMessageToString(message.message)}\n<</SYS>>\n` // Two more \n added by formatLlama2Instruct to make 3 total
        )
        .with({ type: "assistant" }, (message) =>
          chatMessageToString(message.message)
        )
        .otherwise(() => "")
    )
    .otherwise(() => chatMessageToString(message.message));
}

function chatMessageToString(
  messageParts: ChatMessageMessagePart[] | ChatMessageMessagePart
): string {
  const parts = Array.isArray(messageParts) ? messageParts : [messageParts];

  const stringMessage = parts
    .map((part): string => {
      if (typeof part === "string") {
        return part;
      } else if (part.type === "url") {
        return `(Image at ${part.url})`;
      } else if (part.type === "image") {
        return `(Embedded Image)`;
      } else {
        return `(Unknown Message Part)`;
      }
    })
    .join("\n\n");

  return stringMessage;
}