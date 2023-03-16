export const MINE_RATE = 1000

export const INITIAL_DIFFICULTY = 3

export const GENESIS_PUZZLE = {
    id: '1',
    output_map: {},
    input: {
      timestamp : '',
      value : '',
      address : '',
      signature : '',
      data: {
        domain : 'cognitive',
        category: 'knowledge',
        subject : 'riddle',
        level : 1,
        difficulty : 1,
        description : 'We are',
        rules : 'Answer must be in Numbers',
        hint : 'Answer is a one digit number'
      },
      hash: 'genesis_problem_hash'
    },
    solver_map: {},
    calculated_difficulty: 1,
    status: false,
    invalid: 1,
    valid: 1,
    solved: 1,
    wisdom_degeneration_factor: 1,
    wisdom_regeneration_factor: 1,
}


export const GENESIS_DATA = {
    timestamp : 1,
    last_hash : 'no_hash',
    hash : 'genesis_hash',
    data: {},
    puzzle: GENESIS_PUZZLE,
    answer: 0,
    difficulty: INITIAL_DIFFICULTY,
}

export const STARTING_BALANCE = 1000
export const STARTING_WISDOM = 1000

export const REWARD_INPUT = { address: "*OFFICIAL-REWARD*"}

export const MINING_REWARD = 50

export const TOPICS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
  PUZZLE: 'PUZZLE',

}
