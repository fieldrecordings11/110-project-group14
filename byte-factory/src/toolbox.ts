/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/*
Most of the blocks were commented out, since I don't think we'll need them,
but we can easily re-implement them if needed.
*/

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Movement',
      colour: 230,
      contents: [
        {
          kind: 'block',
          type: 'move_down',
        },
        {
          kind: 'block',
          type: 'move_right',
        },
        {
          kind: 'block',
          type: 'move_left',
        },
        {
          kind: 'block',
          type: 'move_up',
        },
        {
          kind: 'block',
          type: 'jump_down',
        },
        {
          kind: 'block',
          type: 'jump_right',
        },
        {
          kind: 'block',
          type: 'jump_left',
        },
        {
          kind: 'block',
          type: 'jump_up',
        },
      ]
    },
    {
      kind: 'category',
      name: 'Actions',
      colour: 360,
      contents: [
        {
          kind: 'block',
          type: 'pick_up',
        },
        {
          kind: 'block',
          type: 'put_down',
        },
        {
          kind: 'block',
          type: 'toggle',
        },
      ]
    },
    {
      kind: 'category',
      name: 'Sensing',
      colour: 120,
      contents: [
        {
          kind: 'block',
          type: 'path_clear_up',
        },
        {
          kind: 'block',
          type: 'path_clear_down',
        },
        {
          kind: 'block',
          type: 'path_clear_right',
        },
        {
          kind: 'block',
          type: 'path_clear_left',
        },
        {
          kind: 'block',
          type: 'puddle_up',
        },
        {
          kind: 'block',
          type: 'puddle_down',
        },
        {
          kind: 'block',
          type: 'puddle_right',
        },
        {
          kind: 'block',
          type: 'puddle_left',
        },
        {
          kind: 'block',
          type: 'is_holding_item',
        },
        {
          kind: 'block',
          type: 'on_finish_grid',
        },
      ]
    },
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_if',
        },
        {
          // if / else, ready-made so players don't have to add "else" with the gear icon
          kind: 'block',
          type: 'controls_if',
          extraState: {
            hasElse: true,
          },
        },
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
        {
          kind: 'block',
          type: 'logic_null',
        },
        {
          kind: 'block',
          type: 'logic_ternary',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      categorystyle: 'loop_category',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_whileUntil',
          fields: {
            MODE: 'UNTIL',
          },
        },
        {
          kind: 'block',
          type: 'controls_for',
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
            BY: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'controls_forEach',
        },
        {
          kind: 'block',
          type: 'controls_flow_statements',
        },
      ],
    },
    // {
    //   kind: 'category',
    //   name: 'Math',
    //   categorystyle: 'math_category',
    //   contents: [
    //     {
    //       kind: 'block',
    //       type: 'math_number',
    //       fields: {
    //         NUM: 123,
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_arithmetic',
    //       inputs: {
    //         A: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //         B: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_single',
    //       inputs: {
    //         NUM: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 9,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_trig',
    //       inputs: {
    //         NUM: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 45,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_constant',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_number_property',
    //       inputs: {
    //         NUMBER_TO_CHECK: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 0,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_round',
    //       fields: {
    //         OP: 'ROUND',
    //       },
    //       inputs: {
    //         NUM: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 3.1,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_on_list',
    //       fields: {
    //         OP: 'SUM',
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_modulo',
    //       inputs: {
    //         DIVIDEND: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 64,
    //             },
    //           },
    //         },
    //         DIVISOR: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 10,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_constrain',
    //       inputs: {
    //         VALUE: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 50,
    //             },
    //           },
    //         },
    //         LOW: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //         HIGH: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 100,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_random_int',
    //       inputs: {
    //         FROM: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //         TO: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 100,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_random_float',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'math_atan2',
    //       inputs: {
    //         X: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //         Y: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 1,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   kind: 'category',
    //   name: 'Text',
    //   categorystyle: 'text_category',
    //   contents: [
    //     {
    //       kind: 'block',
    //       type: 'text',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_join',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_append',
    //       inputs: {
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: '',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_length',
    //       inputs: {
    //         VALUE: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: 'abc',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_isEmpty',
    //       inputs: {
    //         VALUE: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: '',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_indexOf',
    //       inputs: {
    //         VALUE: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //         FIND: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: 'abc',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_charAt',
    //       inputs: {
    //         VALUE: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_getSubstring',
    //       inputs: {
    //         STRING: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_changeCase',
    //       inputs: {
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: 'abc',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_trim',
    //       inputs: {
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: 'abc',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_count',
    //       inputs: {
    //         SUB: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_replace',
    //       inputs: {
    //         FROM: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //         TO: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'text_reverse',
    //       inputs: {
    //         TEXT: {
    //           shadow: {
    //             type: 'text',
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   kind: 'category',
    //   name: 'Lists',
    //   categorystyle: 'list_category',
    //   contents: [
    //     {
    //       kind: 'block',
    //       type: 'lists_create_with',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_create_with',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_repeat',
    //       inputs: {
    //         NUM: {
    //           shadow: {
    //             type: 'math_number',
    //             fields: {
    //               NUM: 5,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_length',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_isEmpty',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_indexOf',
    //       inputs: {
    //         VALUE: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_getIndex',
    //       inputs: {
    //         VALUE: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_setIndex',
    //       inputs: {
    //         LIST: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_getSublist',
    //       inputs: {
    //         LIST: {
    //           block: {
    //             type: 'variables_get',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_split',
    //       inputs: {
    //         DELIM: {
    //           shadow: {
    //             type: 'text',
    //             fields: {
    //               TEXT: ',',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_sort',
    //     },
    //     {
    //       kind: 'block',
    //       type: 'lists_reverse',
    //     },
    //   ],
    // },
    // {
    //   kind: 'sep',
    // },
    // {
    //   kind: 'category',
    //   name: 'Variables',
    //   categorystyle: 'variable_category',
    //   custom: 'VARIABLE',
    // },
    // {
    //   kind: 'category',
    //   name: 'Functions',
    //   categorystyle: 'procedure_category',
    //   custom: 'PROCEDURE',
    // },
  ],
};

/**
 * The toolbox for one level: only the blocks the level allows, with empty
 * categories removed. Keeps players from dragging in blocks the validator rejects.
 */
export function toolboxFor(allowedBlocks: readonly string[]) {
  return {
    ...toolbox,
    contents: toolbox.contents
      .map((category) => ({
        ...category,
        contents: category.contents.filter((item) => allowedBlocks.indexOf(item.type) !== -1),
      }))
      .filter((category) => category.contents.length > 0),
  };
}
