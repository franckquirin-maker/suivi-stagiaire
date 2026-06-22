<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class TypeEv extends Model
{
    protected string $table = 'type_ev';
    protected string $primaryKey = 'id_type';
}
