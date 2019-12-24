use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let minarg = &args[1];
    let maxarg = &args[2];
    let min: u32 = minarg.parse().unwrap();
    let max: u32 = maxarg.parse().unwrap();
    println!("Min: {}, max: {}", min, max);

    let mut good_pins = 0;
    let mut good_pins_part2 = 0;
    for pin in min..=max {
//        println!("Trying: {}", pin);
        let pin = pin.to_string();
        if test_pin(&pin) {
            good_pins += 1;
        }
        if test_pin_with_groups(&pin) {
            good_pins_part2 += 1;
        }
    }
    println!("Good pins: {}", good_pins);
    println!("Good pins, part 2: {}", good_pins_part2);
}



fn test_pin(pin: &str) -> bool{
//    println!("Testing: {}", pin);
    let mut has_adjacents: bool = false;
    let pin = pin.as_bytes(); // assume we only get proper pins, meaning no utf8-foolery here
    for index in 0..pin.len()-1 {
        if pin[index] == pin[index+1] {
            has_adjacents = true;
        }
        if pin[index] > pin[index + 1] {
//            println!("Has decreasing!");
            return false;
        }
    }
//    println!("has adjacents: {}", has_adjacents);
    return has_adjacents;
}

fn test_pin_with_groups(pin: &str) -> bool{
        let mut has_adjacents: bool = false;
        let mut repeat_counter: u8 = 0;
        let pin = pin.as_bytes(); // assume we only get proper pins, meaning no utf8-foolery here
        for index in 0..pin.len()-1 {
            if pin[index] > pin[index + 1] {
                return false;
            }

            if has_adjacents {
                continue;
            } 

            if pin[index] == pin[index + 1] {
                repeat_counter += 1;
            }

            if pin[index] != pin[index + 1] {
                if repeat_counter == 1 {
                    has_adjacents = true;
                } else {
                    repeat_counter = 0;
                }
            }
            
        }
        return has_adjacents || (repeat_counter == 1);
    }


#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_pin_all_same() {
        assert_eq!(test_pin(&"111111"), true);
    }

    #[test]
    fn test_test_pin_with_groups() {
        assert_eq!(test_pin_with_groups(&"111111"), false);
        assert_eq!(test_pin_with_groups(&"111122"), true);
        assert_eq!(test_pin_with_groups(&"221111"), false);
        assert_eq!(test_pin_with_groups(&"112222"), true);
        assert_eq!(test_pin_with_groups(&"112233"), true);
        assert_eq!(test_pin_with_groups(&"123444"), false);
        assert_eq!(test_pin_with_groups(&"123445"), true);
    } 
}