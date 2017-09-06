(defmacro while (condition body)
  (define loop (lambda ()
                 (if (condition)
                     (begin body)
                     (loop)))))

(define n 10)

(while (> n 0)
       (display n)
       (set! n (- n 1)))
