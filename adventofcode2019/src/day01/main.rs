use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    solve(&contents, "part1", fuel_requirements_part1);
    solve(&contents, "part2", fuel_requirements_part2);
}

fn solve(contents: &str, partname: &str, solver: fn(i32) -> i32) {
    let parse = |line: &str| {
        let line: i32 = line.trim().parse().expect("Failed to parse as number");
        solver(line)
    };
    let sum: i32 = contents.lines().map(parse).sum();
    println!("sum of modules fuel requirements, {}: {}", partname, sum);
}

fn fuel_requirements_part1(module_mass: i32) -> i32 {
    (module_mass / 3) - 2
}

fn fuel_requirements_part2(module_mass: i32) -> i32 {
    let fuel_mass = fuel_requirements_part1(module_mass);
    if fuel_mass > 0 {
        return fuel_mass + fuel_requirements_part2(fuel_mass);
    }
    
    return 0;
}
