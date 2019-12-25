use std::io;
use std::io::Write; // for flush
use std::collections::HashMap;

#[derive(Hash, Eq, PartialEq, Debug)]
enum ParamMode {
    Position,
    Immediate,
    Relative,
}

pub struct Execution {
    pub memory: Vec<i64>,
    pub inputs: Vec<i64>,
    pub ip: usize
}


pub fn execute_instruction(memory: &mut HashMap<usize, i64>, ip: usize, inputs: &mut Option<&mut Vec<i64>>, outputs: &mut Option<&mut Vec<i64>>, relative_base: &mut isize) -> usize{

    let opcode = memory[&ip] % 100;

    return match opcode {
        1  => add(memory, ip, relative_base),
        2  => mul(memory, ip, relative_base),
        3  => input(memory, ip, inputs, relative_base),
        4  => output(memory, ip, outputs, relative_base),
        5  => jump_if_true(memory, ip, relative_base),
        6  => jump_if_false(memory, ip, relative_base),
        7  => less_than(memory, ip, relative_base),
        8  => equals(memory, ip, relative_base),
        9  => adjust_relative_base(memory, ip, relative_base),
        _  => panic!("Unknown opcode: {}", opcode),
    }
}

pub fn run_program(program: &mut Vec<i64>, inputs: &mut Option<&mut Vec<i64>>, outputs: &mut Option<&mut Vec<i64>>) {
    let mut ip = 0;
    let mut relative_base = 0;
    let mut memory = program_to_memory(program);
//    println!("Memory after reading program {:?}", memory);
//    print_memory(&memory);
    while program[ip] != 99 {
        ip = execute_instruction(&mut memory, ip, inputs, outputs, &mut relative_base);
    }
}

// Will break day 7 but i can't be arse to refactor 
pub fn run_execution(_execution: &mut Execution, _outputs: &mut Option<&mut Vec<i64>>) -> Option<i64> {
    None
}
/*
pub fn run_execution(execution: &mut Execution, outputs: &mut Option<&mut Vec<i64>>) -> Option<i64>{
    let memory = program_to_memory(program: &Vec<i64>)
    while execution.memory[execution.ip] != 99 {
        execution.ip = execute_instruction(&mut execution.memory, execution.ip, &mut Some(&mut execution.inputs), outputs);
        if outputs.is_some() && outputs.as_ref().unwrap().len() != 0 {
            return Some(1); // not halted, just produced output value
        }
    }

    return None; // halted
}
*/

pub fn print_code(code: &Vec<i64>) {
    for num in code {
        print!("[{}] ", num);
    }
    println!("");
}


pub fn print_memory(memory:  &HashMap<usize, i64>) {
    let mut keys: Vec<&usize> = memory.keys().collect();
    keys.sort();
    for k in keys {
        print!("{}:{}, ", k, memory[k]);
    }
    println!("");
}

fn get_parameter(program: &HashMap<usize, i64>, address: usize, mode: &ParamMode, relative_base: &isize) -> i64 {
    match mode {
        ParamMode::Position => {
            let position: usize = (*program.get(&address).unwrap_or(&0)) as usize;
            *program.get(&(position as usize)).unwrap_or(&0)
        },
        ParamMode::Immediate => program[&address],
        ParamMode::Relative => {
            let position: isize = (*program.get(&address).unwrap_or(&0)) as isize;
//            *program.get(&(position as usize + relative_base)).unwrap_or(&0)
            *program.get(&((position + relative_base) as usize)).unwrap_or(&0)
        },
    }
}

fn relative(address: i64, relative_base: &isize, mode: &ParamMode) -> usize {
    match mode {
        ParamMode::Relative  => {
            (address + (*relative_base as i64)) as usize
        },
        _ => address as usize
    }
}

fn get_parameter_modes(opcode: i64) -> (ParamMode, ParamMode, ParamMode) {

    // convert to str, left pad with zeros to len of 5
    let opcode: String = format!("{:0>5}", opcode);
    let immediate = '1' as u8;
    let positional = '0' as u8;
    let relative = '2' as u8;
    let bytes = opcode.as_bytes();

    let mode = |character: u8| -> ParamMode {
        if character == immediate {
            return ParamMode::Immediate;
        } else if character == positional {
            return ParamMode::Position;
        } else if character == relative {
            return ParamMode::Relative;
        }        
        else {
            panic!("Unknown parameter mode: {}", character);
        }
    }; 
    

    return (mode(bytes[2]), mode(bytes[1]), mode(bytes[0]));

} 

fn add(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base);
    let to = program[&(ip+3)];
    let to = relative(to, &relative_base, &param_modes.2);
    
    program.insert(to, a + b); //[&to] = a + b;
    
    ip + 4
}

fn mul(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base);
    let to = program[&(ip+3)];
    let to = relative(to, &relative_base, &param_modes.2);
    program.insert(to, a * b); //[&to] = a * b;

    ip + 4
}

fn input(program: &mut HashMap<usize, i64>, ip: usize, inputs: &mut Option<&mut Vec<i64>>, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let to = program[&(ip+1)];
    let to = relative(to, &relative_base, &param_modes.0);
    //println!("Input to {}, param {}, base {}", to, program[&(ip+1)], relative_base);

    let mut input = String::new();

    let input: i64 =
    match inputs {
        Some(input_vec) => {
            input_vec.remove(0)
        },
        None => {
            print!("input > " );
            let _ = io::stdout().flush();
            match io::stdin().read_line(&mut input) {
                Ok(_) => {},
                Err(error) => panic!("error: {}", error),
            };
            input.trim().parse().expect("Could not parse i64")
        }
    };

    program.insert(to, input);
    ip + 2
}

fn output(program: &mut HashMap<usize, i64>, ip: usize, outputs: &mut Option<&mut Vec<i64>>, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let value = get_parameter(program, ip+1, &param_modes.0, relative_base);

    match outputs {
        Some(output_vec) => output_vec.push(value),
        None => println!("output > {}", value)
    }

    ip + 2
}

fn jump_if_true(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base) as usize;
    return match a != 0 {
        true => b,
        false => ip + 3
    };
}

fn jump_if_false(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base) as usize;
    match a == 0 {
        true => b,
        false => ip + 3
    }
}


fn less_than(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base);
    let to = program[&(ip+3)];
    let to = relative(to, &relative_base, &param_modes.2);
    match a < b {
        true => program.insert(to, 1),
        false => program.insert(to, 0)
    };
    ip + 4
}

fn equals(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base);
    let b = get_parameter(program, ip+2, &param_modes.1, relative_base);
    let to = program[&(ip+3)];
    let to = relative(to, &relative_base, &param_modes.2);
    match a == b {
        true => program.insert(to, 1),
        false => program.insert(to, 0)
    };
    ip + 4
}


fn adjust_relative_base(program: &mut HashMap<usize, i64>, ip: usize, relative_base: &mut isize) -> usize {
    let param_modes = get_parameter_modes(program[&ip]);
    let a = get_parameter(program, ip+1, &param_modes.0, relative_base) as isize;
    *relative_base = *relative_base + a;

    ip + 2
}


fn program_to_memory(program: &Vec<i64>) -> HashMap<usize, i64> {
    let mut memory: HashMap<usize, i64> = HashMap::new();
    for (address, data) in program.iter().enumerate() {
        memory.insert(address, *data);
    }

    memory
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_add() {
        let mut v = program_to_memory(&vec![1, 5, 6, 7, 99, 10, 20, 0]);
        let ip = add(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&7], 30);
    }

    #[test]
    fn test_add_immediate() {
        let mut v = program_to_memory(&vec![101, 5, 6, 7, 99, 10, 20, 0]);
        let ip = add(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&7], 25); // 5 + 20
    }

    #[test]
    fn test_mul() {
        let mut v = program_to_memory(&vec![2, 5, 6, 7, 99, 10, 25, 0]);
        let ip = mul(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&7], 250);
    }

    #[test]
    fn test_mul_immediate() {
        let mut v = program_to_memory(&vec![1002, 5, 6, 7, 99, 10, 25, 0]);
        let ip = mul(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&7], 60); // 10 * 6
    }

    #[test]
    fn test_get_parameter() {
        let v: Vec<i64> = vec![0, 777, 1, 9, 5];
        let p = get_parameter(&program_to_memory(&v), 2, &ParamMode::Position, &0);
        assert_eq!(p, 777);

        let p = get_parameter(&program_to_memory(&v), 3, &ParamMode::Immediate, &0);
        assert_eq!(p, 9);

        let p = get_parameter(&program_to_memory(&v), 4, &ParamMode::Relative, &-2);
        assert_eq!(p, 9);
    }

    #[test]
    fn test_get_parameter_mode() {
        assert_eq!(get_parameter_modes(102), (ParamMode::Immediate, ParamMode::Position, ParamMode::Position));
        assert_eq!(get_parameter_modes(1002), (ParamMode::Position, ParamMode::Immediate, ParamMode::Position));
    }

    #[test]
    fn test_negative_integers() {
        let mut v = program_to_memory(&vec![1101,100,-1,4,0]);
        let ip = add(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&4], 99); // 100 + (-1)
    }

    #[test]
    fn test_jump_if_true() {
        let mut v: Vec<i64> = vec![1105,1,9];
        let ip = jump_if_true(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 9);

        let mut v: Vec<i64> = vec![1105,0,9];
        let ip = jump_if_true(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 3);

        let mut v: Vec<i64> = vec![5,1,0];
        let ip = jump_if_true(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 5);
    }

    #[test]
    fn test_jump_if_false() {
        let mut v: Vec<i64> = vec![1105,0,9];
        let ip = jump_if_false(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 9);

        let mut v: Vec<i64> = vec![1105,1,9];
        let ip = jump_if_false(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 3);

        let mut v: Vec<i64> = vec![5,2,0];
        let ip = jump_if_false(&mut program_to_memory(&v), 0, &0);
        assert_eq!(ip, 5);
    }

    #[test]
    fn test_less_than() {
        let mut v = program_to_memory(&vec![1106,0,1,4,88]);
        let ip = less_than(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&4], 1);

        let mut v = program_to_memory(&vec![1106,1,0,4,88]);
        less_than(&mut v, 0, &0);
        assert_eq!(v[&4], 0);

        let mut v = program_to_memory(&vec![6,0,2,4,88]);
        less_than(&mut v, 0, &0);
        assert_eq!(v[&4], 0);

        let mut v = program_to_memory(&vec![6,0,4,4,88]);
        less_than(&mut v, 0, &0);
        assert_eq!(v[&4], 1);
    }

    #[test]
    fn test_equals() {
        let mut v = program_to_memory(&vec![1106,1,1,4,88]);
        let ip = equals(&mut v, 0, &0);
        assert_eq!(ip, 4);
        assert_eq!(v[&4], 1);

        let mut v = program_to_memory(&vec![1106,1,0,4,88]);
        equals(&mut v, 0, &0);
        assert_eq!(v[&4], 0);

        let mut v = program_to_memory(&vec![6,5,3,4,88,4]);
        equals(&mut v, 0, &0);
        assert_eq!(v[&4], 1);

        let mut v = program_to_memory(&vec![6,0,3,4,88]);
        equals(&mut v, 0, &0);
        assert_eq!(v[&4], 0);
    }


    #[test]
    fn test_input() {
        let mut memory = program_to_memory(&vec![3,2,0]);
        let mut inputs = vec![42, 66];
        let ip = input(&mut memory, 0, &mut Some(&mut inputs), &0);
        assert_eq!(ip, 2);
        assert_eq!(memory[&2], 42);
        assert_eq!(inputs.len(), 1);
    }

    #[test]
    fn test_output() {
        let mut outputs = vec![44];
        let mut memory = program_to_memory(&vec![4,2,666]);
        let ip = output(&mut memory, 0, &mut Some(&mut outputs), &0);
        assert_eq!(ip, 2);
        assert_eq!(outputs.len(), 2);
        assert_eq!(outputs.first(), Some(&44));
        assert_eq!(outputs.last(), Some(&666));
    }


    #[test]
    fn test_large_mul() {
        let mut v = vec![1102,34915192,34915192,7,4,7,99,0];
        let mut outputs = vec![];
        run_program(&mut v, &mut None, &mut Some(&mut outputs));
        assert_eq!(outputs.first(), Some(&1219070632396864));
    }


    #[test]
    fn test_extended_memory() {
        let mut outputs = vec![];
        // output whatever is in addr 678, it should default to 0
        let mut memory = program_to_memory(&vec![4,678]);
        let ip = output(&mut memory, 0, &mut Some(&mut outputs), &0);
        assert_eq!(ip, 2);
        assert_eq!(outputs.len(), 1);
        assert_eq!(outputs.first(), Some(&0));

        let mut v = vec![
            4, 200,  // output from 200, should be 2
            1101, 5, 6, 200, // save 5 + 6 to 200
            4, 200, // output again
            99];
        let mut outputs = vec![];
        run_program(&mut v, &mut None, &mut Some(&mut outputs));
        assert_eq!(outputs.first(), Some(&0));
        assert_eq!(outputs.last(), Some(&11));
    }
}