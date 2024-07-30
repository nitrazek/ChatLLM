import { Callbacks } from "langchain/callbacks";
import { BaseTransformOutputParser, FormatInstructionsOptions } from "langchain/schema/output_parser";

interface CustomOutputParserFields {};

class CustomTransformOutputParser extends BaseTransformOutputParser<string> {
  lc_namespace = ["langchain", "output_parsers"];

  constructor(fields?: CustomOutputParserFields) {
    super(fields);
  }

  async parse(text: string, callbacks?: Callbacks): Promise<string> {
    return JSON.stringify({ answer: text });
  }

  getFormatInstructions(options?: FormatInstructionsOptions): string {
    return "";
  }
}

export default CustomTransformOutputParser;