use std::env;
use std::fs;


fn main() {
    let args: Vec<String> = env::args().collect();

    let mut contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");
/*
    let mut layers: Vec<Vec<String>>  = vec![];
    loop {
        let mut layer: Vec<String> = vec![];
        for _ in 0..6 {
            let rest = contents.split_off(25);
            layer.push(contents);
            contents = rest;
        }
        layers.push(layer);
        if contents.len() == 0 {
            break;
        } 
    }

    let mut min_layer = vec!{};
    let mut min_0_digits = usize::max_value();
    for layer in layers {
        let num_0_digits = count_chars(&layer, "0");
        if num_0_digits < min_0_digits {
            min_0_digits = num_0_digits;
            min_layer = layer;
        }
    }

    println!("Layer that has min num of 0's ({}) {:?},", min_0_digits, min_layer);
    let num_1_digits = count_chars(&min_layer, "1");
    let num_2_digits = count_chars(&min_layer, "2");
    println!("1's ({}) x 2's ({}) = {}", num_1_digits, num_2_digits, num_1_digits * num_2_digits);
    */


    let mut layers: Vec<Vec<Vec<u32>>>  = vec![];
    loop {
        let mut layer: Vec<Vec<u32>> = vec![];
        for _ in 0..6 {
            let rest = contents.split_off(25);
            let as_digits: Vec<u32> = contents.chars().map(|c| {
                let d: u32 = c.to_digit(10).unwrap();
                d
            }).collect();
            layer.push(as_digits);
            contents = rest;
        }
        layers.push(layer);
        if contents.len() == 0 {
            break;
        } 
    }

    let mut min_layer = vec!{};
    let mut min_0_digits = usize::max_value();
    for layer in &layers {
        let num_0_digits = count_digits(&layer, 0);
        if num_0_digits < min_0_digits {
            min_0_digits = num_0_digits;
            min_layer = layer.to_vec();
        }
    }
    println!("Layer that has min num of 0's ({}):", min_0_digits);
    print_layer(&min_layer);
    let num_1_digits = count_digits(&min_layer, 1);
    let num_2_digits = count_digits(&min_layer, 2);
    println!("1's ({}) x 2's ({}) = {}", num_1_digits, num_2_digits, num_1_digits * num_2_digits);

    merge(&layers);

}

fn count_digits(layer: &Vec<Vec<u32>>, digit: u32) -> usize {
    let digitmatcher = |row: &Vec<u32>| {
        let m: Vec<&u32> = row.iter().filter(|d| **d == digit).collect(); //string.matches(digit).collect();
        m.len()
    };
    let rowmatches: Vec<usize> = layer.iter().map(digitmatcher).collect();
    rowmatches.into_iter().sum()
}

fn count_chars(layer: &Vec<String>, digit: &str) -> usize {
    let digitmatcher = |string: &String| {
        let m: Vec<&str> = string.matches(digit).collect();
        m.len()
    };
    let rowmatches: Vec<usize> = layer.into_iter().map(digitmatcher).collect();
    rowmatches.into_iter().sum()
}

fn merge(layers: &Vec<Vec<Vec<u32>>>) {
    //let merged: Vec<Vec<u32> = vec![];
    let mut merged: Vec<Vec<u32>> = (0..6).map(|row| (0..25).map(|col| 2).collect()).collect();
    for row in 0..6 {
        for col in 0..25 {
            merged[row][col] = merged_pixel(layers, row, col);
        }
    }

    print_layer(&merged);
}

fn merged_pixel(layers: &Vec<Vec<Vec<u32>>>, row: usize, col: usize) -> u32 {
    for layer in layers {
        match layer[row][col] {
            0 => return 0,
            1 => return 1,
            _ => continue
        }
    }
    return 2;
}

fn print_layer(layer: &Vec<Vec<u32>>) {
    for row in layer {
        for col in row {
            match col {
                0 => print!(" "),
                1 => print!("*"),
                _ => print!("_"),
            };
        }
        println!("");
    }
}