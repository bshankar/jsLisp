(begin
  (define fun (lambda (x k)
                (define r (* 2 k))
                (* r x)))
  (fun 5))
